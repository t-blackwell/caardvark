import Logo from "./Logo";
import MenuIcon from "@mui/icons-material/Menu";
import { Avatar, Divider, Link, Tooltip } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { cyan } from "@mui/material/colors";
import type { user } from "@prisma/client";
import { Form, Link as RemixLink } from "@remix-run/react";
import * as React from "react";
import useSmallScreen from "~/hooks/useSmallScreen";

interface NavBarAuthenticatedProps {
  anchorElUser: null | HTMLElement;
  setAnchorElUser: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
  user: user;
}

function NavBarAuthenticated({
  anchorElUser,
  setAnchorElUser,
  user,
}: NavBarAuthenticatedProps) {
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          <Avatar sx={{ backgroundColor: cyan[600] }}>
            {user.first_name !== null
              ? user.first_name.toUpperCase().charAt(0)
              : user.email.toUpperCase().charAt(0)}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: "45px" }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={anchorElUser !== null}
        onClose={handleCloseUserMenu}
      >
        <MenuItem
          component={RemixLink}
          to="/profile"
          onClick={handleCloseUserMenu}
        >
          <Typography textAlign="center">Profile</Typography>
        </MenuItem>
        <MenuItem
          component={RemixLink}
          to="/cards"
          onClick={handleCloseUserMenu}
        >
          <Typography textAlign="center">My Cards</Typography>
        </MenuItem>
        <Divider />
        <Form action="/logout" method="post" className="Nav__signout">
          <button type="submit" className="Nav__signout">
            <MenuItem onClick={handleCloseUserMenu}>Sign Out</MenuItem>
          </button>
        </Form>
      </Menu>
    </>
  );
}

function NavbarUnuthenticated() {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const smScreen = useSmallScreen();

  return smScreen ? (
    <>
      <Link
        component={RemixLink}
        to="/login"
        className="Nav__linkButton"
        underline="none"
      >
        <Button>Sign In</Button>
      </Link>
      <Link
        component={RemixLink}
        to="/signup"
        className="Nav__linkButton"
        underline="none"
      >
        <Button>Sign Up</Button>
      </Link>
    </>
  ) : (
    <>
      <IconButton onClick={() => setIsOpen((prev) => !prev)}>
        <MenuIcon />
      </IconButton>
      <Menu
        sx={{ mt: "45px" }}
        id="menu-appbar"
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={isOpen}
      >
        <MenuItem component={RemixLink} to="/login">
          <Typography textAlign="center">Sign in</Typography>
        </MenuItem>
        <MenuItem component={RemixLink} to="/signup">
          <Typography textAlign="center">Sign up</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

interface NavBarProps {
  anchorElUser: null | HTMLElement;
  setAnchorElUser: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
  user: user | undefined;
}

export default function NavBar({
  anchorElUser,
  setAnchorElUser,
  user,
}: NavBarProps) {
  return (
    <Box sx={{ flexGrow: 0 }}>
      <AppBar className="NavBar" position="static" elevation={3}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Logo size="small" />
          </Box>
          {user !== undefined ? (
            <NavBarAuthenticated
              anchorElUser={anchorElUser}
              setAnchorElUser={setAnchorElUser}
              user={user}
            />
          ) : (
            <NavbarUnuthenticated />
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
