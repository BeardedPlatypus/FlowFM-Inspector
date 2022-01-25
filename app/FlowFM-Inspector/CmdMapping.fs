namespace FlowFM_Inspector

open Elmish

module public CmdMapping =
    open FlowFM_Inspector.Presentation.Main

    let private startCoreCmd () : Cmd<Msg> =
        async {
            do! Async.SwitchToThreadPool ()

            Infrastructure.Core.Start 8000u

            return Msg.NoOp
        } |> Cmd.OfAsync.result

    let public toCmd (cmdMsg: CmdMsg) : Cmd<Msg> =
        match cmdMsg with
        | CmdMsg.StartCore -> startCoreCmd ()  

