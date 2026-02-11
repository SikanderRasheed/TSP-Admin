import React from "react";
import { Switch } from 'antd'
const SwitchInput = (props) => {
	let { handleSwitch, size } = props

	return <Switch onChange={handleSwitch} size={size} />
}

export default SwitchInput
