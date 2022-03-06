import React, { useState } from "react";
import { EditorState, AtomicBlockUtils } from 'draft-js';
import { FormGroup, FormControlLabel, Checkbox, Button, TextField, Dialog, DialogActions, DialogContent } from '@mui/material'
import { EditorStateType, EditorStateProps } from '../common';
import { BooleanLiteral } from "typescript";
import { getAllByPlaceholderText, queryAllByAttribute } from "@testing-library/react";

const styles = {
    image: {
        color: '#3b5998',
        textDecoration: 'underline',
    },
};

interface ImageEditorProps extends EditorStateProps {
    onToggle: (editorState: EditorState) => void;
    open: boolean;
}

export const isEnable = (props: EditorStateProps): boolean => {
    const { state } = props;
    const { editorState } = state;
    const selection = editorState.getSelection();
    const isCollapsed = selection.isCollapsed();
    return isCollapsed;
}

// 画像表示タグ生成コンポーネント
const Imgtag = (props: any) => {
    return <img src={props.src} alt="" />;
};

export const mediaBlockRenderer = (block: Draft.ContentBlock) => {
    if (block.getType() === 'atomic') {
        return {
            component: Media,
            editable: false,
        };
    }
    return null;
}


// 
export const Media = (props: any) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    const { src } = entity.getData();
    const type = entity.getType();

    let media;
    if (type === "IMAGE") {
        media = <Imgtag src={src} />;
    }
    return media;
}

export const ImageDialog = (props: ImageEditorProps) => {
    const { state, onToggle } = props;
    const { editorState } = state;
    const [imageState, setImageState] = useState<{ showUrlInput: boolean; src: string; imageKey: null | string }>
        ({ showUrlInput: false, src: "", imageKey: null })

    const selection = editorState.getSelection();
    const isCollapsed = selection.isCollapsed();    // 網掛け時 false
    if ((props.open === true) && (imageState.showUrlInput === false) && (isCollapsed === true)) {
        imageState.src = "https://www.appliot.co.jp/wp-content/uploads/2022/02/fc5983a421ff37a15b5e7b32656744a9.png";
        imageState.showUrlInput = true;
        setImageState({ ...imageState });
    }

    const imageCancel = (e: any) => {
        e.preventDefault();
        onToggle(editorState);
        setImageState({
            showUrlInput: false,
            src: "",
            imageKey: null,
        });
    }

    const imageConfirm = (e: any) => {
        //    alert("imageConfirm has been excuted");
        e.preventDefault();
        //const {editorState, urlValue, urlType} = state;
        const { editorState } = state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'IMAGE',
            'IMMUTABLE',
            { src: imageState.src }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(
            editorState,
            { currentContent: contentStateWithEntity }
        );

        onToggle(
            AtomicBlockUtils.insertAtomicBlock(
                newEditorState,
                entityKey,
                ' '
            )
        )

        // Reset statments
        setImageState({
            showUrlInput: false,
            src: "",
            imageKey: null,
        });
    }

    return (
        <React.Fragment>
            <Dialog open={imageState.showUrlInput} onClose={imageCancel}>
                <DialogContent>
                    <TextField
                        autoFocus
                        defaultValue={imageState.src}
                        margin="dense"
                        id="url"
                        label="URL"
                        type="url"
                        fullWidth
                        onChange={(e: any) => {
                            imageState.src = e.currentTarget.value;
                            setImageState({ ...imageState });
                        }}
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={imageCancel}>Cancel</Button>
                    <Button onClick={imageConfirm}>OK</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}