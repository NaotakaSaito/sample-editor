import React, { useState, useRef} from "react";
import { EditorState, RichUtils,  DraftDecorator, ContentState, convertToRaw, Modifier } from 'draft-js';
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


// 画像表示タグ生成コンポーネント
const Imgtag = (props: any) => {
    return <img src={props.src} alt="" />;
};

// 
export const Media = (props: any) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    const { src } = entity.getData();
    const type = entity.getType();

    let media = null;
    if (type === "IMAGE") {
        media = <Imgtag src={ src }  />;
    }
    return media;
}

export const ImageDialog = (props: ImageEditorProps) => {
    const { state, onToggle } = props;
    const { editorState } = state;
    const [imageState, setImageState] = useState<{ showUrlInput: boolean; src: string; disableRemove: boolean; imageKey: null | string}>
        ({ showUrlInput: false,   src: "",     disableRemove: true,  imageKey: null})
    let urlRef: any = useRef();

    if (props.open === true && imageState.showUrlInput === false) {
        const selection = editorState.getSelection();
        const isCollapsed = selection.isCollapsed();    // 網掛け時 false
        //console.log("### isCollapsed ### ");
        //console.log(isCollapsed);
        const contentState = editorState.getCurrentContent();   //
        //console.log("### contentState ###");
        //console.log(contentState);
        const startKey = selection.getStartKey();   // カーソル箇所 block の key
        //console.log("### startKey ###");
        //console.log(startKey);
        const startOffset = editorState.getSelection().getStartOffset();    // 左端を0としてカーソル選択位置までの文字数
        //console.log("### startOffset ###");
        //console.log(startOffset);
        const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey); // startKey の ブロック情報を取得
        //console.log("### blockWithLinkAtBeginning ###");
        //console.log(blockWithLinkAtBeginning);
        const imageKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
        //console.log("### imageKey ### ");      // ブロック内、カーソル選択位置にリンクが指定されているか
        //console.log(imageKey);
        const activeBlocksText = blockWithLinkAtBeginning.getText();    // カーソルを当てたブロックのテキスト取得
        //console.log("### imageText ###")
        //console.log(activeBlocksText);


        // if (imageKey) {     // リンクが設定されている時　設定済みの情報を imageStateに格納
        //     const imageInstance = contentState.getEntity(imageKey);
        //     const data = imageInstance.getData();
        //     imageState.url = data.url;
        //     imageState.targetBlank = data.target ? true : false;
        //     imageState.disableRemove = false;
        // } else {    // リンクが無い時　初期化？
        //     imageState.url = "";
        //     imageState.targetBlank = false;
        //     imageState.disableRemove = true;
        // }

        //　初期値
        imageState.src = "";
        imageState.disableRemove = true;
    
        //　テキスト入力がされてないブロックにのみ画像挿入を許可
        if (activeBlocksText === "") {
            imageState.showUrlInput = true;
            setImageState({ ...imageState });
            setTimeout(() => urlRef.current.focus(), 0);
        }
    };

    const imageCancel = (e: any) => {
        e.preventDefault();
        onToggle(editorState);
        setImageState({
            showUrlInput: false,
            src: "",
            imageKey: null,
            disableRemove: false,
        });
    }

    const imageConfirm = (e: any) => {
    //    alert("imageConfirm has been excuted");
        e.preventDefault();
        const contentState = editorState.getCurrentContent();
        const selectionState = editorState.getSelection();

        console.log("### EditorState ###")
        console.log({raw: convertToRaw(editorState.getCurrentContent())});

        // Entityを作成（entityMapに新しい画像のメタ情報を追加）
        const contentStateWithEntity = contentState.createEntity(
            'IMAGE',
            'IMMUTABLE',
            { src: imageState.src },
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { 
            currentContent: contentStateWithEntity,
        });
        const selection = newEditorState.getSelection();

        console.log("### new EditorState ###")
        console.log({raw: convertToRaw(newEditorState.getCurrentContent())});

        //The RitchUtils module is a static set of utility functions for 
        //rich text editing.

        onToggle(
            RichUtils.toggleLink (
                newEditorState,
                selection,
                entityKey
            )
        )

        console.log("### EditorState ###")
        console.log({raw: convertToRaw(editorState.getCurrentContent())});
        
        // Reset statments
        setImageState({
            showUrlInput: false,
            src: "",
            imageKey: null,
            disableRemove: false,
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
                            setImageState( {...imageState});
                        }}
                        variant="standard"
                        inputRef={urlRef}
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