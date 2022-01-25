namespace FlowFM_Inspector.Infrastructure.Processes

open System
open System.ComponentModel
open System.Runtime.InteropServices


/// <summary>
/// The <see cref="External"/> module contains the external calls related to Processes.
/// </summary>
/// <remarks>
/// See the <see cref="https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/functions/external-functions">the msdn documentation</see>.
/// </remarks>
module internal External =
    [<Literal>]
    let private kernel32 = "kernel32.dll"

    /// <summary>
    /// <see cref="JobObjectInfoType"/> defines the job object type.
    /// </summary>
    type internal JobObjectInfoType =
    | AssociateCompletionPortInformation = 7
    | BasicLimitInformation = 2
    | BasicUIRestrictions = 4
    | EndOfJobTimeInformation = 6
    | ExtendedLimitInformation = 9
    | SecurityLimitInformation = 5
    | GroupInformation = 11

    [<DllImport(kernel32, CharSet = CharSet.Unicode)>]
    extern IntPtr CreateJobObject(IntPtr lpJobAttributes, string name);

    [<DllImport(kernel32)>]
    extern bool SetInformationJobObject(IntPtr job, 
                                        JobObjectInfoType infoType,
                                        IntPtr lpJobObjectInfo, 
                                        uint cbJobObjectInfoLength);

    [<DllImport(kernel32, SetLastError = true)>]
    extern bool AssignProcessToJobObject(IntPtr job, IntPtr processPtr);

    [<Flags>]
    type internal JOBOBJECTLIMIT =
    | JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000u

    [<Struct>]
    [<StructLayout(LayoutKind.Sequential)>]
    type internal JOBOBJECT_BASIC_LIMIT_INFORMATION =
        val mutable PerProcessUserTimeLimit: Int64
        val mutable PerJobUserTimeLimit: Int64
        val mutable LimitFlags: JOBOBJECTLIMIT 
        val mutable MinimumWorkingSetSize: UIntPtr 
        val mutable MaximumWorkingSetSize: UIntPtr 
        val mutable ActiveProcessLimit: UInt32 
        val mutable Affinity: Int64 
        val mutable PriorityClass: UInt32 
        val mutable SchedulingClass: UInt32 

    [<Struct>]
    [<StructLayout(LayoutKind.Sequential)>]
    type internal IO_COUNTERS =
        val mutable ReadOperationCount: UInt64 
        val mutable WriteOperationCount: UInt64 
        val mutable OtherOperationCount: UInt64 
        val mutable ReadTransferCount: UInt64 
        val mutable WriteTransferCount: UInt64 
        val mutable OtherTransferCount: UInt64 

    [<Struct>]
    [<StructLayout(LayoutKind.Sequential)>]
    type internal JOBOBJECT_EXTENDED_LIMIT_INFORMATION =
        val mutable BasicLimitInformation: JOBOBJECT_BASIC_LIMIT_INFORMATION 
        val mutable IoInfo: IO_COUNTERS 
        val mutable ProcessMemoryLimit: UIntPtr
        val mutable JobMemoryLimit: UIntPtr
        val mutable PeakProcessMemoryUsed: UIntPtr 
        val mutable PeakJobMemoryUsed: UIntPtr 

    /// <summary>
    /// Configure the parent process by setting the information job object of the parent
    /// process' <paramref name="jobHandle"/>
    /// </summary>
    /// <param name="jobHandle">The job handle of the parent.</param>
    let internal ConfigureParentProcess (jobHandle: IntPtr): unit =
        let mutable Info = JOBOBJECT_BASIC_LIMIT_INFORMATION()
        Info.LimitFlags <- JOBOBJECTLIMIT.JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        
        let mutable ExtendedInfo = JOBOBJECT_EXTENDED_LIMIT_INFORMATION()
        ExtendedInfo.BasicLimitInformation <- Info
        
        let length = Marshal.SizeOf(typedefof<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>)
        let mutable ExtendedInfoPtr = Marshal.AllocHGlobal(length)
        
        try
            Marshal.StructureToPtr(ExtendedInfo, ExtendedInfoPtr, false)
        
            if (not (SetInformationJobObject(jobHandle, 
                                             JobObjectInfoType.ExtendedLimitInformation,
                                             ExtendedInfoPtr,
                                             uint32(length))))
            then raise (Win32Exception())
            else ()
        finally
            Marshal.FreeHGlobal(ExtendedInfoPtr)

