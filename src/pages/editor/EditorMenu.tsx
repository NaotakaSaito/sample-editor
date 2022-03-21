import React, { useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Menu } from '@mui/material';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { PopoverOrigin } from '@mui/material';
import { convertToRaw } from 'draft-js';

const settings = [
    { Label: 'Profile' },
    { Label: 'Account' },
    { Label: 'Dashboard' },
    { Label: 'Logout' }
]

export const UserMenu = ({ anchorEl, onClose, anchorOrigin, transformOrigin, Items }: any) => {
    return (
        <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={anchorOrigin}
            keepMounted
            transformOrigin={transformOrigin}
            open={Boolean(anchorEl)}
            onClose={onClose}
        >
            {Items.map((Item: any) => (
                <MenuItem key={Item.Label} onClick={Item.onClick}>
                    <Typography textAlign="center">{Item.Label}</Typography>
                </MenuItem>
            ))}
        </Menu>
    )
}

export const EditorMenu = ({ state, onChange, children }: any) => {
    const { editorState } = state;
    const titleInputRef = useRef<HTMLInputElement>(null)
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const inputFile = useRef<HTMLInputElement>(null);
    const [menuObj, setMenuObj] = React.useState<{
        editTitle: boolean;
        title: string;
        anchorEl: null | HTMLElement;
        Items: Array<{ Label: string; }>;
        transformOrigin: null | PopoverOrigin;
        anchorOrigin: null | PopoverOrigin;
        onClick?: (e: React.MouseEventHandler<HTMLLIElement>) => void;
    }>({
        editTitle: false,
        title: "unknown.json",
        anchorEl: null,
        Items: [],
        transformOrigin: null,
        anchorOrigin: null,
    });

    const pages = [
        {
            Label: 'File',
            Items: [
                {
                    Label: "new",
                    onClick: (e: React.MouseEventHandler<HTMLButtonElement>) => {
                        menuObj.anchorEl = null;
                        menuObj.title = "unknown.json";
                        setMenuObj({ ...menuObj });
                        onChange({
                            blocks: [],
                            entityMap: {}
                        })
                    }
                },
                {
                    Label: "open",
                    onClick: (e: React.MouseEventHandler<HTMLButtonElement>) => {
                        menuObj.anchorEl = null;
                        setMenuObj({ ...menuObj });
                        inputFile.current?.click();
                    }
                },
                {
                    Label: "save",
                    onClick: (e: React.MouseEventHandler<HTMLButtonElement>) => {
                        const obj = convertToRaw(editorState.getCurrentContent());
                        const blob = new Blob([JSON.stringify(obj)], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        document.body.appendChild(a);
                        a.download = menuObj.title;
                        a.href = url;
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);

                        menuObj.anchorEl = null;
                        setMenuObj({ ...menuObj });
                    }
                }
            ]
        }
    ];
    const handleCloseUserMenu = () => {
        menuObj.anchorEl = null;
        setMenuObj({ ...menuObj });
    };
    return (
        <React.Fragment>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ mr: 2 }}
                            onDoubleClick={(e: any) => {
                                menuObj.editTitle = true;
                                setMenuObj({ ...menuObj });
                            }}
                        >
                            {menuObj.editTitle === false ?
                                menuObj.title :
                                (<input
                                    defaultValue={menuObj.title}
                                    ref={titleInputRef}
                                    onKeyDown={(e) => {
                                        switch (e.key) {
                                            case "Enter":
                                                menuObj.title = titleInputRef.current?.value as string;
                                                menuObj.editTitle = false;
                                                setMenuObj({ ...menuObj });
                                                break;
                                            case "Escape":
                                                menuObj.editTitle = false;
                                                setMenuObj({ ...menuObj });
                                                break;
                                        }
                                    }}></input>)}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                            {pages.map((page) => (
                                <Button
                                    key={page.Label}
                                    onClick={(e) => {
                                        menuObj.anchorEl = e.currentTarget;
                                        menuObj.Items = page.Items;
                                        menuObj.anchorOrigin = {
                                            vertical: 'top',
                                            horizontal: 'left',
                                        };
                                        menuObj.transformOrigin = {
                                            vertical: 'top',
                                            horizontal: 'left',
                                        };
                                        setMenuObj({ ...menuObj });
                                    }}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    {page.Label}
                                </Button>
                            ))}
                        </Box>

                        <UserMenu
                            anchorEl={menuObj.anchorEl}
                            onClose={handleCloseUserMenu}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            Items={menuObj.Items}
                        />
                        <input
                            id="file"
                            type="file"
                            style={{ display: "none" }}
                            ref={inputFile}
                            onChange={(e) => {
                                new Promise<string>((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.onerror = () => reject(reader.error);
                                    reader.onload = () => resolve((reader.result as string) || '');
                                    const files = e?.target?.files;
                                    if (files && files.length > 0) {
                                        menuObj.title = files[0].name;
                                        setMenuObj({ ...menuObj })
                                        reader.readAsText(files[0]);
                                    } else {
                                        reject({ message: 'file not found' });
                                    }
                                }).then((values) => {
                                    const obj = JSON.parse(values);
                                    if (obj) {
                                        onChange(obj);
                                    }
                                }).catch((err) => {
                                    console.log(err);
                                });
                            }}
                        />
                    </Toolbar>
                </Container>
            </AppBar >
            {children}
        </React.Fragment >
    );
};

