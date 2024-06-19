import React from 'react';
import { ConfigProvider, Switch } from 'antd';
import useGeneral from '../hooks/useGeneral';
const DarkSwitch = () => {
  const {darkMode,setDarkMode} = useGeneral();
  const onChange = (checked) => {
    setDarkMode(checked)
  };


return (<ConfigProvider theme={{
 components:{
  Switch:{
      colorPrimary: 'black',
      colorPrimaryHover: '#000',
  }
  }
}}>
<Switch className={`${darkMode ? 'border-white':'border-none'} border-2 border-white`} value={darkMode} defaultChecked={darkMode} onChange={onChange} />
</ConfigProvider>
)};
export default DarkSwitch;