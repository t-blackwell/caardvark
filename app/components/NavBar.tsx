import { Avatar, Divider, Link, Tooltip } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Form, Link as RemixLink } from "@remix-run/react";
import * as React from "react";

interface NavBarProps {
  loggedIn: boolean;
}

export default function NavBar({ loggedIn }: NavBarProps) {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return loggedIn ? (
    <Box sx={{ flexGrow: 0 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cards
          </Typography>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
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
            open={Boolean(anchorElUser)}
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
        </Toolbar>
      </AppBar>
    </Box>
  ) : (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cards
          </Typography>
          <Link component={RemixLink} to="/login" className="Nav__linkButton">
            <Button>Sign In</Button>
          </Link>
          <Link component={RemixLink} to="join" className="Nav__linkButton">
            <Button>Sign Up</Button>
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
