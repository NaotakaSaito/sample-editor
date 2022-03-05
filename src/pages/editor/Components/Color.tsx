import React from 'react'
import { Popover, Box } from '@mui/material'
import { EditorState, RichUtils, Modifier } from 'draft-js';
import { EditorStateProps } from '../common'

const swatch: React.CSSProperties = {
  padding: '5px',
  background: '#fff',
  borderRadius: '1px',
  boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
  display: 'inline-block',
  verticalAlign: 'middle',
  cursor: 'pointer',
};
const cover: React.CSSProperties = {
  position: 'fixed',
  top: '0px',
  right: '0px',
  bottom: '0px',
  left: '0px',
};


interface ColorPickerProps extends EditorStateProps {
  onToggle: (editorState: EditorState) => void;
  colors: Array<string>;
}
export const ColorPicker = function (props: ColorPickerProps) {
  const { state, onToggle, colors } = props;
  const { editorState } = state;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  var currentStyle = editorState.getCurrentInlineStyle();

  const handleClick = (e: any) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'editorjs-color-picker' : undefined;
  const color = colors.find((elm) => currentStyle.has(elm)) || colors[0];

  return (
    <React.Fragment>
      <div
        aria-describedby={id}
        style={swatch}
        onClick={handleClick}
      >
        <div
          style={{
            width: '36px',
            height: '14px',
            borderRadius: '2px',
            background: color
          }} />
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <ColorButton
          colors={colors}
          state={state}
          selectColor={color}
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, color: string) => {
            const selection = editorState.getSelection();
            const nextContentState = colors.reduce((contentState, color) => {
              return Modifier.removeInlineStyle(contentState, selection, color)
            }, editorState.getCurrentContent());

            let nextEditorState = EditorState.push(
              editorState,
              nextContentState,
              'change-inline-style'
            );

            if (selection.isCollapsed()) {
              nextEditorState = currentStyle.reduce((state: any, color: any) => {
                return RichUtils.toggleInlineStyle(state, color);
              }, nextEditorState);
            }

            if (!currentStyle.has(color) && (color !== colors[0])) {
              nextEditorState = RichUtils.toggleInlineStyle(
                nextEditorState,
                color
              );
            } else {
              color = colors[0];
            }
            onToggle(nextEditorState);
          }}
        />
      </Popover>
    </React.Fragment>
  )
}



const ColorButton = (props: {
  colors: Array<string>;
  selectColor: string;
  state: any;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, color: string) => void;
}) => {
  const { selectColor, colors, onClick } = props;
  return (
    <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }} style={{ width: 180 }}>
      {colors.map((elm, index) =>
        <button
          key={`color-button-${elm}`}
          style={{
            margin: 5,
            padding: 2,
            backgroundColor: elm,
            borderRadius: 10,
            border: 'solid',
            borderColor: selectColor === elm ? '#000000' : '#e7e7e7',
            width: 20,
            height: 20
          }}
          onClick={(e) => onClick(e, elm)}
        />
      )}
    </Box>
  )
}