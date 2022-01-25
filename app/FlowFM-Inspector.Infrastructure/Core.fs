namespace FlowFM_Inspector.Infrastructure


open System.Diagnostics
open FlowFM_Inspector.Infrastructure.Processes.ChildProcess


/// <summary>
/// <see cref="Core"/> defines the methods related to the Python core server.
/// </summary>
module public Core =

    /// <summary>
    /// Start the Core server at the specified <paramref name="portNumber"/>.
    /// </summary>
    /// <param name="portNumber>The port number on which the server runs.</param>
    let public Start (portNumber: uint) : unit =
        let mutable startInfo = ProcessStartInfo()
        startInfo.CreateNoWindow <- false
        startInfo.WindowStyle <- ProcessWindowStyle.Hidden
        startInfo.UseShellExecute <- false
        startInfo.FileName <- "./server/core.exe"
        startInfo.Arguments <- $"{portNumber}"

        let serverProcess = Process.Start(startInfo)
        AddChildProcess(serverProcess)
