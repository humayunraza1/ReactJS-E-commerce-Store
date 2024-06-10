import React from 'react';
import { ConfigProvider, Switch } from 'antd';
import { ColorFactory } from 'antd/es/color-picker/color';
import { GeneralContext } from '../context/GeneralProvider';
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
      colorPrimaryHover: '#000'
  }
  }
}}>
<Switch defaultChecked={darkMode} onChange={onChange} />
</ConfigProvider>
)};
export default DarkSwitch;