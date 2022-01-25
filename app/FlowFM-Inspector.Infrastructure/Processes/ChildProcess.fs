namespace FlowFM_Inspector.Infrastructure.Processes

open System
open System.ComponentModel
open System.Diagnostics


/// <summary>
/// <see cref="ChildProcess"/> defines the methods related to managing child processes
/// of the FlowFM Inspector application.
/// </summary>
/// <remarks>
/// See <see cref="https://stackoverflow.com/questions/3342941/kill-child-process-when-parent-process-is-killed">StackOverflow</see> for additional details.
/// </remarks>
module public ChildProcess =
    let private JobName: string = $"FlowFM-Inspector_{Process.GetCurrentProcess().Id}"
    let private JobHandle: IntPtr = External.CreateJobObject(IntPtr.Zero, JobName)
    External.ConfigureParentProcess JobHandle

    /// <summary>
    /// Add the specified <paramref name="childProcess" /> to the parent process, such
    /// that it is closed when the parent process is closed.
    /// </summary>
    /// <param name="childProcess">The child process to add.</param>
    let public AddChildProcess (childProcess: Process): unit =
        if JobHandle.Equals IntPtr.Zero then
           ()
        else
           let success: bool = 
               External.AssignProcessToJobObject(JobHandle, childProcess.Handle)
       
           if (not success &&  not childProcess.HasExited) then
               raise (Win32Exception())
           else
               ()
