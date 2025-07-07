import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Divider
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import ClearAllIcon from '@mui/icons-material/ClearAll';

const HistoryButton = ({ 
  history, 
  currentIndex, 
  onRestore, 
  onRemoveItem, 
  onClearHistory, 
  hasHistory,
  disabled = false 
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRestore = (index) => {
    onRestore(index);
    handleClose();
  };

  const handleRemoveItem = (id) => {
    onRemoveItem(id);
  };

  const handleClearHistory = () => {
    onClearHistory();
    handleClose();
  };

  return (
    <>
      <Tooltip title="View History">
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={handleOpen}
          disabled={disabled || !hasHistory}
          sx={{ minWidth: 'auto' }}
        >
          History
        </Button>
      </Tooltip>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Run History</Typography>
            {hasHistory && (
              <Tooltip title="Clear All History">
                <IconButton 
                  onClick={handleClearHistory}
                  color="error"
                  size="small"
                >
                  <ClearAllIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {!hasHistory ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              No history available. Run some analyses to see them here.
            </Typography>
          ) : (
            <List sx={{ pt: 0 }}>
              {history.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    sx={{
                      backgroundColor: index === currentIndex ? 'action.selected' : 'transparent',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      secondary={`${new Date(item.timestamp).toLocaleDateString()} at ${new Date(item.timestamp).toLocaleTimeString()}`}
                      primaryTypographyProps={{
                        fontWeight: index === currentIndex ? 'bold' : 'normal'
                      }}
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        {index === currentIndex && (
                          <Typography 
                            variant="caption" 
                            color="primary" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              mr: 1
                            }}
                          >
                            Current
                          </Typography>
                        )}
                        <Tooltip title="Restore this run">
                          <IconButton
                            edge="end"
                            onClick={() => handleRestore(index)}
                            disabled={index === currentIndex}
                            color="primary"
                            size="small"
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove from history">
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveItem(item.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < history.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HistoryButton; 