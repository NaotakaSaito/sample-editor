import React, { useState, useRef, useReducer } from "react";
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, CompositeDecorator, convertToRaw, convertFromRaw, SelectionState } from 'draft-js';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import 'draft-js/dist/Draft.css';
import './richeditor.css'

interface EditorStateType {
    editorState: EditorState;
    linkState: {
        showUrlInput: boolean;
        url: string;
    }
}

const styles = {
    root: {
        fontFamily: '\'Georgia\', serif',
        padding: 20,
        width: 600,
    },
    buttons: {
        marginBottom: 10,
    },
    urlInputContainer: {
        marginBottom: 10,
    },
    urlInput: {
        fontFamily: '\'Georgia\', serif',
        marginRight: 10,
        padding: 3,
    },
    editor: {
        border: '1px solid #ccc',
        cursor: 'text',
        minHeight: 80,
        padding: 10,
    },
    button: {
        marginTop: 10,
        textAlign: 'center',
    },
    link: {
        color: '#3b5998',
        textDecoration: 'underline',
    },
};

export const findLinkEntities = (contentBlock: any, callback: any, contentState: any): void => {
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
}
export function Link(props: any) {
    const { url } = props.contentState.getEntity(props.entityKey).getData();
    return (
        <div>
            <a href={url} style={styles.link} >
                {props.children}
            </a>
        </div>
    )
};

const compositeDecorator = new CompositeDecorator([
    {
        strategy: findLinkEntities,
        component: Link,
    }
]);

const styleMap = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    },
};
function getBlockStyle(block: any): any {
    switch (block.getType()) {
        case 'blockquote': return 'RichEditor-blockquote';
        default: return null;
    }
}

const StyleButton = (props: any) => {
    const onToggle = (e: any) => {
        e.preventDefault();
        props.onToggle(props.style);
    };
    let className = 'RichEditor-styleButton';
    if (props.active) {
        className += ' RichEditor-activeButton';
    }
    return (
        <span className={className} onMouseDown={onToggle}>
            {props.label}
        </span>
    );
}

const LinkButton = (props: any) => {
    const { state, onChange, setState } = props;
    const { editorState } = state as EditorStateType;
    const [linkState, setLinkState] = useState({ showUrlInput: false, url: "" })
    let urlRef: any = useRef();
    console.log(props);

    const onMouseDown = (e: any) => {
        e.preventDefault();
    };
    let className = 'RichEditor-styleButton';
    if (props.active) {
        className += ' RichEditor-activeButton';
    }
    const promptForLink = (e: any) => {
        e.preventDefault();
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
            const contentState = editorState.getCurrentContent();
            const startKey = editorState.getSelection().getStartKey();
            const startOffset = editorState.getSelection().getStartOffset();
            const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
            const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);

            let url = '';
            if (linkKey) {
                const linkInstance = contentState.getEntity(linkKey);
                url = linkInstance.getData().url;
            }
            linkState.showUrlInput = true;
            linkState.url = url;
            setLinkState({ ...linkState });
            setTimeout(() => urlRef.current.focus(), 0);
        }
    };

    const onUrlChange = (e: any) => {
        console.log(e);
        linkState.url = e.currentTarget.value;
        setLinkState({ ...linkState });
    }
    const linkConfirm = (e: any) => {
        e.preventDefault();
        /*
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'LINK',
            'MUTABLE',
            { url: linkState.url }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        setState({
            editorState: RichUtils.toggleLink(
                newEditorState,
                newEditorState.getSelection(),
                entityKey
            ),
            showURLInput: false,
            urlValue: '',
        }

        */
        linkState.showUrlInput = false;
        setLinkState({ ...linkState });
        console.log("linkConfirm");
    }
    const linkCancel = (e: any) => {
        e.preventDefault();
        linkState.showUrlInput = false;
        setLinkState({ ...linkState });
        console.log("linkCancel");
    }
    const linkRemove = (e: any) => {
        e.preventDefault();
        linkState.showUrlInput = false;
        setLinkState({ ...linkState });
        console.log("linkRemove");
    }
    return (
        <React.Fragment>
            <span className={className} onMouseDown={promptForLink}>
                {props.label}
            </span>
            <Dialog open={linkState.showUrlInput} onClose={linkCancel}>
                <DialogTitle>Subscribe</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Email Address"
                        type="email"
                        fullWidth
                        onChange={onUrlChange}
                        variant="standard"
                        inputRef={urlRef}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={linkCancel}>Cancel</Button>
                    <Button onClick={linkRemove}>Remove</Button>
                    <Button onClick={linkConfirm}>OK</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
const BLOCK_TYPES = [
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    { label: 'H4', style: 'header-four' },
    { label: 'H5', style: 'header-five' },
    { label: 'H6', style: 'header-six' },
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' },
    { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = (props: any) => {
    const { editorState } = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};

var INLINE_STYLES = [
    { label: 'Bold', style: 'BOLD' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'Underline', style: 'UNDERLINE' },
    { label: 'Monospace', style: 'CODE' },
];
const InlineStyleControls = (props: any) => {
    const { editorState } = props;
    const currentStyle = editorState.getCurrentInlineStyle();
    return (
        <div className="RichEditor-controls">
            {INLINE_STYLES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};
const LinkStyleControls = (props: any) => {
    const { state } = props;
    const { editorState } = state;
    const currentStyle = editorState.getCurrentInlineStyle();
    return (
        <div className="RichEditor-controls">
            <LinkButton
                key={"Link"}
                active={currentStyle.has("LINK")}
                label={"Link"}
                state={state}
                {...props}
                onChange={(state: EditorStateType) => {
                    const contentState = editorState.getCurrentContent();
                    const contentStateWithEntity = contentState.createEntity(
                        'LINK',
                        'MUTABLE',
                        { url: editorState.link.urlValue }
                    );
                    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
                    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });

                }}
                style={"LINK"}
            />
        </div>
    );
};
const initData: any = {
    "blocks": [
        {
            "key": "ad6f8",
            "text": "asdfadsfad",
            "type": "unstyled",
            "depth": 0,
            "inlineStyleRanges": [],
            "entityRanges": [],
            "data": {}
        },
        {
            "key": "8ccm",
            "text": "Hello",
            "type": "header-one",
            "depth": 0,
            "inlineStyleRanges": [],
            "entityRanges": [],
            "data": {}
        },
        {
            "key": "37l4l",
            "text": "こんにちは",
            "type": "unstyled",
            "depth": 0,
            "inlineStyleRanges": [],
            "entityRanges": [],
            "data": {}
        },
        {
            "key": "cnhts",
            "text": "",
            "type": "unstyled",
            "depth": 0,
            "inlineStyleRanges": [],
            "entityRanges": [],
            "data": {}
        }
    ],
    "entityMap": {}
};

export function EditorApp(props: any) {
    const [state, setState] = React.useState<EditorStateType>({
        editorState: EditorState.createWithContent(convertFromRaw(initData), compositeDecorator),
        linkState: { showUrlInput: false, url: "" }
    });
    const { editorState, linkState } = state;
    const ref = useRef<HTMLInputElement>(null);

    const onChange = (editorState: any) => {
        state.editorState = editorState;
        setState({ ...state });
    }
    const handleKeyCommand = (command: any, state: any): any => {
        const newEditorState = RichUtils.handleKeyCommand(editorState, command);
        if (newEditorState) {
            onChange({ editorState: newEditorState });
            return true;
        }
        return false;
    }
    const mapKeyToEditorCommand = (e: any): any => {
        if (e.keyCode === 9 /* TAB */) {
            const newEditorState = RichUtils.onTab(
                e,
                editorState,
                4, /* maxDepth */
            );
            if (newEditorState !== state.editorState) {
                onChange({ editorState: newEditorState });
            }
            return;
        }
        return getDefaultKeyBinding(e);
    }

    const toggleBlockType = (blockType: any): any => {
        onChange(
            RichUtils.toggleBlockType(
                editorState,
                blockType
            )
        );
    }

    const contentState = editorState.getCurrentContent();
    let className = 'RichEditor-editor';

    if (!contentState.hasText()) {
        if (contentState.getBlockMap().first().getType() !== 'unstyled') {
            className += ' RichEditor-hidePlaceholder';
        }
    }

    const toggleInlineStyle = (inlineStyle: any) => {
        onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
    }
    const toggleLinkStyle = (inlineStyle: any) => {
        onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
    }

    return (
        <div className="RichEditor-root">
            <BlockStyleControls
                editorState={editorState}
                onToggle={toggleBlockType}
            />
            <InlineStyleControls
                editorState={editorState}
                onToggle={toggleInlineStyle}
            />
            <LinkStyleControls
                state={state}
                setState={setState}
                onToggle={toggleLinkStyle}
            />

            <div className={className}>
                <Editor
                    blockStyleFn={getBlockStyle}
                    customStyleMap={styleMap}
                    editorState={editorState}
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={mapKeyToEditorCommand}
                    onChange={onChange}
                    placeholder="Tell a story..."
                    spellCheck={true}
                />
            </div>
        </div>
    )
}

