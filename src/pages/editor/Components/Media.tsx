import React, { useState } from "react";
import { EditorState, AtomicBlockUtils } from 'draft-js';
import { FormGroup, FormControlLabel, Checkbox, Button, TextField, Dialog, DialogActions, DialogContent } from '@mui/material'
import { EditorStateType, EditorStateProps } from '../common';
import { BooleanLiteral, isJSDocNullableType } from "typescript";
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
    label: string;
    style: string;
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
    const src = "//www.youtube.com/embed/" + props.src;
    return (
        <iframe src={src}
            width={props.width} height={props.height} ></iframe>
    )
};

export const blockRenderer = (block: Draft.ContentBlock) => {
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
    const { src, height, width } = entity.getData();
    const type = entity.getType();

    let media;
    if (type === "IMAGE") {
        media = <Imgtag src={src} height={height} width={width} />;
    } else if (type === "VIDEO") {
        media = <Videotag src={src} height={height} width={width} />;
    }
    return media;
}

export const MediaDialog = (props: MediaEditorProps) => {
    const { state, onToggle } = props;
    const { editorState } = state;
    const [mediaState, setMediaState] = useState<{ showUrlInput: boolean; src: string; width: number; height: number; mediaKey: null | string }>
        ({ showUrlInput: false, src: "", width: 400, height: 200, mediaKey: null })

    const selection = editorState.getSelection();
    const isCollapsed = selection.isCollapsed();



    if ((props.open === true) && (mediaState.showUrlInput === false) && (isCollapsed === true)) {
        if (props.label === "Video") {
            mediaState.src = "";
        } else {
            mediaState.src = "";
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
            width: 400,
            height: 200,
            mediaKey: null,
        });
    }

    const mediaConfirm = (e: any) => {
        e.preventDefault();
        const { editorState } = state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            props.style,
            'IMMUTABLE',
            { src: mediaState.src, width: mediaState.width, height: mediaState.height }
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
            width: 400,
            height: 200,
            mediaKey: null,
        });
    }

    if (props.label === "Video") {
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
                        <TextField
                            defaultValue={mediaState.height}
                            margin="dense"
                            id="height"
                            label="HEIGHT"
                            type="number"
                            onChange={(e: any) => {
                                mediaState.height = e.currentTarget.value;
                                setMediaState({ ...mediaState });
                            }}
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            defaultValue={mediaState.width}
                            margin="dense"
                            id="width"
                            label="WIDTH"
                            type="number"
                            onChange={(e: any) => {
                                mediaState.width = e.currentTarget.value;
                                setMediaState({ ...mediaState });
                            }}
                            variant="outlined"
                            size="small"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={mediaCancel}>Cancel</Button>
                        <Button onClick={mediaConfirm}>OK</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    } else {
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