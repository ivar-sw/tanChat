import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'

interface Props {
  channelName: string | null
  onMenuOpen: () => void
}

export const MobileAppBar = ({ channelName, onMenuOpen }: Props) => (
  <AppBar position="static" color="default" elevation={1}>
    <Toolbar variant="dense">
      <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenuOpen}>
        <MenuIcon />
      </IconButton>
      <Typography variant="subtitle1" sx={{ ml: 1 }}>
        {channelName ? `#${channelName}` : 'Chat'}
      </Typography>
    </Toolbar>
  </AppBar>
)
