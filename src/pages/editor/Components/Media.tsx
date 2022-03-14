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

interface MediaEditorProps extends EditorStateProps {
    onToggle: (editorState: EditorState) => void;
    open: boolean;
    ikey: string;
    ilabel: string;
    istyle: string;
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

const Videotag = (props: any) => {
    const src="//www.youtube.com/embed/" + props.src;
    return (
        <iframe src={src}
        width="400" height="200" ></iframe>
    )
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
    }else if( type === "VIDEO"){
        media = <Videotag src={src} />;
    }
    return media;
}

export const MediaDialog = (props: MediaEditorProps) => {
    const { state, onToggle } = props;
    const { editorState } = state;
    const [mediaState, setMediaState] = useState<{ showUrlInput: boolean; src: string; mediaKey: null | string }>
        ({ showUrlInput: false, src: "", mediaKey: null })

    const selection = editorState.getSelection();
    const isCollapsed = selection.isCollapsed();

    if ((props.open === true) && (mediaState.showUrlInput === false) && (isCollapsed === true)) {
        if(props.ikey === "Video"){
            mediaState.src = "A_ighLADtZU";
        }else{
            mediaState.src = "https://www.appliot.co.jp/wp-content/uploads/2022/02/fc5983a421ff37a15b5e7b32656744a9.png";
        }
        mediaState.showUrlInput = true;
        setMediaState({ ...mediaState });
    }

    const mediaCancel = (e: any) => {
        e.preventDefault();
        onToggle(editorState);
        setMediaState({
            showUrlInput: false,
            src: "",
            mediaKey: null,
        });
    }

    const mediaConfirm = (e: any) => {
        //    alert("imageConfirm has been excuted");
        e.preventDefault();
        //const {editorState, urlValue, urlType} = state;
        const { editorState } = state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            props.istyle,
            'IMMUTABLE',
            { src: mediaState.src }
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
        setMediaState({
            showUrlInput: false,
            src: "",
            mediaKey: null,
        });
    }

    if(props.ikey === "Video"){
        return (
            <React.Fragment>
                <Dialog open={mediaState.showUrlInput} onClose={mediaCancel}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            defaultValue={mediaState.src}
                            margin="dense"
                            id="url"
                            label="URL"
                            type="url"
                            fullWidth
                            onChange={(e: any) => {
                                mediaState.src = e.currentTarget.value;
                                setMediaState({ ...mediaState });
                            }}
                            variant="standard"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={mediaCancel}>Cancel</Button>
                        <Button onClick={mediaConfirm}>OK</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }else{
        return (
            <React.Fragment>
                <Dialog open={mediaState.showUrlInput} onClose={mediaCancel}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            defaultValue={mediaState.src}
                            margin="dense"
                            id="url"
                            label="URL"
                            type="url"
                            fullWidth
                            onChange={(e: any) => {
                                mediaState.src = e.currentTarget.value;
                                setMediaState({ ...mediaState });
                            }}
                            variant="standard"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={mediaCancel}>Cancel</Button>
                        <Button onClick={mediaConfirm}>OK</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}