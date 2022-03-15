import React, { useState, useRef, useReducer } from "react";
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, CompositeDecorator, convertToRaw, convertFromRaw, SelectionState, } from 'draft-js';
import { Box } from '@mui/material'
import { stateToHTML } from 'draft-js-export-html';
import * as Link from "./Components/Link"
import * as Media from "./Components/Media"
import { ColorPicker } from './Components/Color';
import { EditorStateType } from './common'

import 'draft-js/dist/Draft.css';
import './richeditor.css'


const compositeDecorator = new CompositeDecorator([Link.decorator]);

const colors = ['#000000', '#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505',
    '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986',
    '#4A4A4A', '#9B9B9B', '#FFFFFF'];

const styleMap: any = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    },
};
colors.forEach((elm) => {
    styleMap[elm] = { color: elm }
})
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
        <Box
            component="div"
            className="RichEditor-controls"
            sx={{
                display: 'inline',
                p: 1,
                m: 1,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
                color: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
                border: '1px solid',
                borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: '700',
            }}
        >
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </Box>
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
        <Box
            component="div"
            className="RichEditor-controls"
            sx={{
                display: 'inline',
                p: 1,
                m: 1,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
                color: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
                border: '1px solid',
                borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: '700',
            }}
        >

            {INLINE_STYLES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </Box>
    );
};
const LinkStyleControls = (props: any) => {
    const [open, setOpen] = useState(false);
    let className = 'RichEditor-styleButton';
    if (Link.isActive(props)) {
        className += ' RichEditor-activeButton';
    }
    const onToggle = (editorState: any) => {
        setOpen(false);
        props.onToggle(editorState);
    }
    return (
        <React.Fragment>
            <span className={className} onMouseDown={(e) => {
                e.preventDefault();
                if (Link.isEnable(props)) setOpen(true);
            }}>Link
            </span>
            <Link.LinkDialog
                key={"Link"}
                open={open}
                label={"Link"}
                {...props}
                onToggle={onToggle}
                style={"LINK"}
            />
        </React.Fragment>
    );
};

const MediaStyleControls = (props: any) => {

    const [open, setOpen] = useState(false);
    let className = 'RichEditor-styleButton';
    let key: string, label: string, style: string;
    const onToggle = (editorState: any) => {
        setOpen(false);
        props.onToggle(editorState);
    }

    if(props.mediaType==="Video"){
        key = "Video";
        label = "Video";
        style = "VIDEO";
    }else{
        key = "Image";
        label = "Image";
        style = "IMAGE";
    }
    
    return(
        <React.Fragment>
            <span className={className} onMouseDown={(e) => {
                e.preventDefault();
                if (Media.isEnable(props)) setOpen(true);
            }}>{props.mediaType}
            </span>
            <Media.MediaDialog
                open={open}
                label={label}
                style={style}
                {...props}
                onToggle={onToggle}
            />
        </React.Fragment>
    )
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
            "entityRanges": [
                {
                    "offset": 1,
                    "length": 3,
                    "key": 0
                }
            ],
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
    "entityMap": {
        "0": {
            "type": "LINK",
            "mutability": "MUTABLE",
            "data": {
                "url": "https:/www.yahoo.co.jp",
                "target": "_blank"
            }
        }
    }
}

export function EditorApp(props: any) {
    const [state, setState] = React.useState<EditorStateType>({
        editorState: EditorState.createWithContent(convertFromRaw(initData), compositeDecorator)
    });
    const { editorState } = state;
    console.log({
        html: stateToHTML(editorState.getCurrentContent()),
        raw: convertToRaw(editorState.getCurrentContent())
    });
    const onChange = (editorState: any) => {
        state.editorState = editorState;
        setState({ ...state });
    }
    const handleKeyCommand = (command: any, state: any): any => {
        const newEditorState = RichUtils.handleKeyCommand(editorState, command);
        if (newEditorState) {
            onChange(newEditorState);
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

    const contentState = editorState.getCurrentContent();
    let className = 'RichEditor-editor';

    if (!contentState.hasText()) {
        if (contentState.getBlockMap().first().getType() !== 'unstyled') {
            className += ' RichEditor-hidePlaceholder';
        }
    }
    const toggleBlockType = (blockType: any): any => {
        onChange(
            RichUtils.toggleBlockType(
                editorState,
                blockType
            )
        );
    }
    const toggleInlineStyle = (inlineStyle: any) => {
        onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
    }

    return (
        <div className="RichEditor-root">
            <div style={{ width: '100%' }}>
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={toggleBlockType}
                />
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={toggleInlineStyle}
                />
                <Box
                    component="div"
                    className="RichEditor-controls"
                    sx={{
                        display: 'inline',
                        p: 1,
                        m: 1,
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
                        color: (theme) =>
                            theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
                        border: '1px solid',
                        borderColor: (theme) =>
                            theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                        borderRadius: 2,
                        fontSize: '0.875rem',
                        fontWeight: '700',
                    }}
                >

                    <LinkStyleControls
                        state={state}
                        onToggle={onChange}
                    />
                    <MediaStyleControls
                        state={state}
                        setState={setState}
                        onToggle={onChange}
                        mediaType={"Image"}
                    />
                    <MediaStyleControls
                        state={state}
                        setState={setState}
                        onToggle={onChange}
                        mediaType={"Video"}
                    />
                    <ColorPicker
                        state={state}
                        colors={colors}
                        onToggle={onChange}
                    />
                </Box>
            </div>

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
                    blockRendererFn={Media.mediaBlockRenderer}
                />
            </div>
        </div>
    )
}

