import React, { useState, useRef, useEffect } from "react";
import { EditorState, RichUtils, SelectionState, DraftDecorator, DraftDecoratorType } from 'draft-js';
import { FormGroup, FormControlLabel, Checkbox, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { EditorStateType } from '../common';

const styles = {
    link: {
        color: '#3b5998',
        textDecoration: 'underline',
    },
};
export const decorator: DraftDecorator = {
    strategy: (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges(
            (character: any) => {
                const entityKey = character.getEntity();
                return (
                    entityKey !== null &&
                    contentState.getEntity(entityKey).getType() === 'LINK'
                );
            },
            callback
        );
    },
    component: (props: any) => {
        const { url, target } = props.contentState.getEntity(props.entityKey).getData();
        return (
            <a href={url} target={target} style={styles.link} >
                {props.children}
            </a >
        )
    }
};
export const isActive = (props: any) => {
    const { state } = props;
    const { editorState } = state as EditorStateType;
    const contentState = editorState.getCurrentContent();
    const startKey = editorState.getSelection().getStartKey();
    const startOffset = editorState.getSelection().getStartOffset();
    const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
    const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
    return linkKey ? true : false;
}

export const isEnable = (props: any): boolean => {
    const { state } = props;
    const { editorState } = state as EditorStateType;

    const selection = editorState.getSelection();
    const isCollapsed = selection.isCollapsed();
    const contentState = editorState.getCurrentContent();
    const startKey = editorState.getSelection().getStartKey();
    const startOffset = editorState.getSelection().getStartOffset();
    const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
    const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
    if (!isCollapsed || linkKey) {
        return true;
    }
    return false;
}

export const LinkDialog = (props: any) => {
    const { state, onToggle } = props;
    const { editorState } = state as EditorStateType;
    const [linkState, setLinkState] = useState<{ showUrlInput: boolean; url: string; disableRemove: boolean; targetBlank: boolean; linkKey: null | string }>({ showUrlInput: false, url: "", disableRemove: true, targetBlank: false, linkKey: null })
    let urlRef: any = useRef();

    if (props.open === true && linkState.showUrlInput === false) {
        const selection = editorState.getSelection();
        const isCollapsed = selection.isCollapsed();
        const contentState = editorState.getCurrentContent();
        const startKey = editorState.getSelection().getStartKey();
        const startOffset = editorState.getSelection().getStartOffset();
        const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
        const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
        if (linkKey) {
            const linkInstance = contentState.getEntity(linkKey);
            const data = linkInstance.getData();
            linkState.linkKey = linkKey;
            linkState.url = data.url;
            linkState.targetBlank = data.target ? true : false;
            linkState.disableRemove = false;
        } else {
            linkState.linkKey = null;
            linkState.url = "";
            linkState.targetBlank = false;
            linkState.disableRemove = true;
        }
        if (!isCollapsed || linkKey) {
            linkState.showUrlInput = true;
            setLinkState({ ...linkState });
            setTimeout(() => urlRef.current.focus(), 0);
        }
    };

    const linkConfirm = (e: any) => {
        e.preventDefault();
        const contentState = editorState.getCurrentContent();
        if (linkState.linkKey) {
            const newData = { url: linkState.url, ...linkState.targetBlank ? { target: "_blank" } : null };
            contentState.replaceEntityData(linkState.linkKey, newData);
            onToggle(editorState);
        } else {
            const contentStateWithEntity = contentState.createEntity(
                'LINK',
                'MUTABLE',
                { url: linkState.url, ...linkState.targetBlank ? { target: "_blank" } : null },
            );
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
            const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
            const selection = newEditorState.getSelection();
            onToggle(
                RichUtils.toggleLink(
                    newEditorState,
                    selection,
                    entityKey
                )
            );
        }
        setLinkState({
            showUrlInput: false,
            url: "",
            targetBlank: linkState.targetBlank,
            linkKey: null,
            disableRemove: false,
        });
    }
    const linkRemove = (e: any) => {
        e.preventDefault();
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const beforeBlock = contentState.getBlockBefore(selection.getStartKey())
        const endBlock = contentState.getBlockForKey(selection.getEndKey())
        const blockSelection = new SelectionState({
            anchorKey: beforeBlock?.getKey() || selection.getStartKey(),
            anchorOffset: beforeBlock?.getLength() || 0,
            focusKey: selection.getEndKey(),
            focusOffset: endBlock.getLength(),
        });
        onToggle(RichUtils.toggleLink(editorState, blockSelection, null));
        linkState.showUrlInput = false;
        setLinkState({
            showUrlInput: false,
            url: "",
            targetBlank: linkState.targetBlank,
            linkKey: null,
            disableRemove: false,
        });
    }
    const linkCancel = (e: any) => {
        e.preventDefault();
        onToggle(editorState);
        setLinkState({
            showUrlInput: false,
            url: "",
            targetBlank: linkState.targetBlank,
            linkKey: null,
            disableRemove: false,
        });
    }
    return (
        <React.Fragment>
            <Dialog open={linkState.showUrlInput} onClose={linkCancel}>
                <DialogContent>
                    <TextField
                        autoFocus
                        defaultValue={linkState.url}
                        margin="dense"
                        id="url"
                        label="URL"
                        type="url"
                        fullWidth
                        onChange={(e: any) => {
                            linkState.url = e.currentTarget.value;
                            setLinkState({ ...linkState });
                        }}
                        variant="standard"
                        inputRef={urlRef}
                    />
                    <FormGroup>
                        <FormControlLabel
                            control={<Checkbox
                                checked={linkState.targetBlank}
                                onChange={(e: any) => {
                                    linkState.targetBlank = e.currentTarget.checked;
                                    setLinkState({ ...linkState });
                                }}
                            />} label="target_blank" />
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={linkCancel}>Cancel</Button>
                    <Button onClick={linkRemove} disabled={linkState.disableRemove} >Remove</Button>
                    <Button onClick={linkConfirm}>OK</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
