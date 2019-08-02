import { Form } from 'react-bootstrap';
import * as React from 'react';
import { FormGroup } from './FormGroup';

export const InlineTextGroup = ({
  onBlur = () => {},
  id,
  label,
  placeHolderText,
  tooltipHeader,
  tooltipText,
  value,
  disabled = false,
  onChange = () => {},
  touched = false,
  error = undefined,
  subText
}: {
  id: string;
  label: string;
  placeHolderText?: string;
  tooltipHeader?: string;
  tooltipText?: JSX.Element | string | undefined;
  value?: string;
  disabled?: boolean;
  onBlur?: () => void;
  onChange?: (value: any) => void;
  touched?: boolean;
  error?: string | undefined;
  subText?: string | undefined;
}): JSX.Element => {
  return (
    <FormGroup
      id={id}
      label={label}
      tooltipHeader={tooltipHeader}
      tooltipText={tooltipText}
      touched={touched}
      error={error}
    >
      <Form.Control
        onBlur={() => {
          onBlur();
        }}
        disabled={disabled}
        autoComplete="off"
        type="text"
        value={value}
        placeholder={placeHolderText}
        onChange={onChange}
      />
      <Form.Text className="text-muted">{subText}</Form.Text>
    </FormGroup>
  );
};
