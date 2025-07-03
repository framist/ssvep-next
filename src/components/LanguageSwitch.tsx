import { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    handleClose();
  };

  return (
    <>
      <Tooltip title={t('language.switch')}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => handleLanguageChange('zh-CN')}
          selected={i18n.language === 'zh-CN'}
        >
          {t('language.chinese')}
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange('en-US')}
          selected={i18n.language === 'en-US'}
        >
          {t('language.english')}
        </MenuItem>
      </Menu>
    </>
  );
}
