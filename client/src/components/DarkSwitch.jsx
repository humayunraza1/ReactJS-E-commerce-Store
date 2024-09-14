import React from 'react';
import { ConfigProvider, Switch, Tooltip } from 'antd';
import useGeneral from '../hooks/useGeneral';
import { FloatButton } from 'antd';
import { MoonOutlined,SunOutlined } from '@ant-design/icons';
const DarkSwitch = () => {
  const {darkMode,setDarkMode} = useGeneral();
  const onChange = () => {
    setDarkMode((prev)=> !prev)
  };


return (
<>
<ConfigProvider theme={{
  components:{
    Tooltip:{
      fontSize:'0.8rem',
    },
    FloatButton:{
      colorBgElevated: darkMode && "#1E293B",
      boxShadowSecondary: darkMode ? "0 6px 16px 0 rgba(255, 255, 255, 0.08), 0 3px 6px -4px rgba(255, 255, 255, 0.12),0 9px 28px 8px rgba(255, 255, 255, 0.05)":"0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)"
    }
  }
}}>
<Tooltip title={darkMode ? 'Light Mode':'Dark Mode'}>
<FloatButton value={darkMode} defaultChecked={darkMode} onClick={onChange} icon={darkMode ? <SunOutlined style={{color:'white'}} />:<MoonOutlined />}/>
</Tooltip>
</ConfigProvider>
</>
)};
export default DarkSwitch;