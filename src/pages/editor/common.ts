import React from "react";
import { EditorState } from 'draft-js';

export interface EditorStateProps {
    state: EditorStateType;
}
export interface EditorStateType {
    editorState: EditorState;
}
