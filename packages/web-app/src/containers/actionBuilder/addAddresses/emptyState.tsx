import React from 'react';
import {IlluObject, ButtonText} from '@aragon/ui-components';

import {FormItem} from '.';

type Props = {
  onClick: () => void;
  title: string;
  subtitle: string;
  buttonLabel: string;
};

// This needs to be removed when the empty state is implemented
const EmptyState: React.FC<Props> = ({
  onClick,
  title,
  subtitle,
  buttonLabel,
}) => {
  return (
    <FormItem className="pt-3 pb-3 rounded-b-xl">
      <div className="flex flex-col justify-center items-center">
        <IlluObject object="wallet" />
        <div className="flex flex-col items-center">
          <p className="font-bold text-ui-800 ft-text-xl">{title}</p>
          <p className="mt-1.5 text-ui-500 ft-text-base">{subtitle}</p>
          <ButtonText
            label={buttonLabel}
            className="mt-3"
            size="large"
            mode="secondary"
            bgWhite
            onClick={onClick}
          />
        </div>
      </div>
    </FormItem>
  );
};

export default EmptyState;
