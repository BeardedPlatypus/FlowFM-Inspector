open System
open Elmish.WPF

open FlowFM_Inspector.Presentation.Views

[<EntryPoint; STAThread>]
let main _ =
    Program.mkProgramWpfWithCmdMsg
        FlowFM_Inspector.Presentation.Main.init 
        FlowFM_Inspector.Presentation.Main.update 
        FlowFM_Inspector.Presentation.Main.bindings
        FlowFM_Inspector.CmdMapping.toCmd
    |> Program.runWindow (MainView())

