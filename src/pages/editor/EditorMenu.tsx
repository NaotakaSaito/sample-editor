import React, { ReactNode, useRef, FC } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Menu, MenuProps } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { PopoverOrigin } from '@mui/material';
import { convertToRaw } from 'draft-js';
import { fileURLToPath } from 'url';

const settings = [
    { Label: 'Profile' },
    { Label: 'Account' },
    { Label: 'Dashboard' },
    { Label: 'Logout' }
]

export const UserMenu = ({ anchorEl, onClick, onClose, anchorOrigin, transformOrigin, Items }: any) => {
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
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const inputFile = useRef<HTMLInputElement>(null);
    const [menuObj, setMenuObj] = React.useState<{
        anchorEl: null | HTMLElement;
        Items: Array<{ Label: string; }>;
        transformOrigin: null | PopoverOrigin;
        anchorOrigin: null | PopoverOrigin;
        onClick?: (e: React.MouseEventHandler<HTMLLIElement>) => void;
    }>({
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
                        const fileName = `${obj.blocks[0]?.text || obj.blocks[0].key}.json`;

                        console.log({ fileName, obj });

                        const blob = new Blob([JSON.stringify(obj)], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        document.body.appendChild(a);
                        a.download = fileName;
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
    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

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
                            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                        >
                            LOGO
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {pages.map((page) => (
                                    <MenuItem
                                        key={page.Label}
                                        onClick={(e) => {
                                            menuObj.anchorEl = e.currentTarget;
                                            menuObj.Items = page.Items;
                                            menuObj.anchorOrigin = {
                                                vertical: 'center',
                                                horizontal: 'right'
                                            };
                                            menuObj.transformOrigin = {
                                                vertical: 'center',
                                                horizontal: 'right',
                                            };
                                            setMenuObj({ ...menuObj });
                                        }}>
                                        <Typography textAlign="center">{page.Label}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
                        >
                            LOGO
                        </Typography>
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
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
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton
                                    onClick={(e) => {
                                        menuObj.anchorEl = e.currentTarget;
                                        menuObj.anchorOrigin = {
                                            vertical: 'top',
                                            horizontal: 'right',
                                        };
                                        menuObj.transformOrigin = {
                                            vertical: 'top',
                                            horizontal: 'right',
                                        };
                                        menuObj.Items = settings;
                                        setMenuObj({ ...menuObj });
                                    }}
                                    sx={{ p: 0 }}>
                                    <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                                </IconButton>
                            </Tooltip>
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
        </React.Fragment>
    );
};

