﻿namespace FlowFM_Inspector.Presentation

open Elmish.WPF

module public Main =
    type public Model = { todo : bool
    }

    [<RequireQualifiedAccess>]
    type public CmdMsg =
        | StartCore

    type public Msg =
        | NoOp

    let public init (): Model * CmdMsg list = { todo = true }, [ CmdMsg.StartCore ]

    let public update (msg: Msg) (model: Model) : Model * CmdMsg list =
        match msg with 
        | NoOp -> model, []

    let bindings () : Binding<Model, Msg> list = []
