"use client";

import {useState} from 'react';
import OfficeSelect from '../packages/ui/OfficeSelect';

export default function OfficeSelectExample() {
  const [value, setValue] = useState('research');
  return (
    <OfficeSelect
      label="Role"
      value={value}
      onChange={setValue}
      options={[
        {value: 'research', label: 'Research'},
        {value: 'review', label: 'Review'},
      ]}
    />
  );
}
