namespace FlowFM_Inspector

open Elmish

module public CmdMapping =
    open FlowFM_Inspector.Presentation.Main

    let public toCmd (cmdMsg: CmdMsg) : Cmd<Msg> = Cmd.Empty

