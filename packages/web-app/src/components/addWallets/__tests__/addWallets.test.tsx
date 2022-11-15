import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {render, screen, fireEvent} from 'test-utils';
import {AlertProvider} from 'context/alert';

import AddWallets from '..';

const RenderWithForm: React.FC = ({children}) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('AddWallets', () => {
  test('should render', () => {
    render(
      <AlertProvider>
        <RenderWithForm>
          <AddWallets />
        </RenderWithForm>
      </AlertProvider>
    );

    const element = screen.getByTestId('add-wallets');
    expect(element).toBeInTheDocument();
  });

  test('should add row when button click', () => {
    render(
      <AlertProvider>
        <RenderWithForm>
          <AddWallets />
        </RenderWithForm>
      </AlertProvider>
    );

    const element = screen.getByText('Add Wallet');
    fireEvent.click(element);

    const rows = screen.getAllByTestId('wallet-row');
    expect(rows.length).toBe(1);
  });
});
