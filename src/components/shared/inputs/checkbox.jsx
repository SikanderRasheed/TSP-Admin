import React from "react";
import { Checkbox, Form } from 'antd'
import { useState } from 'react'
const CheckBoxInput = ({
	name,
	rules,
	handlecheckbox,
	placeholder,
	disabled,
	checked,
	className,
}) => {
	const [componentDisabled, setComponentDisabled] = useState(true)
	return (
		<Form.Item name={name} rules={rules}>
			<Checkbox
				checked={componentDisabled}
				onChange={(e) => setComponentDisabled(e.target.checked)}
				disabled={disabled}
			>
				<p className={className}>{placeholder}</p>
			</Checkbox>
		</Form.Item>
	)
}

export default CheckBoxInput
