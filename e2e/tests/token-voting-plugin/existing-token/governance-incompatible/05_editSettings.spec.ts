import {LOCALHOST_URL} from '../../../../basic.setup';
import {testWithMetaMask as test} from '../../../../testWithMetaMask';

// // Test is publishing, approving, and executing a proposal to edit a DAO settings
test('Edit DAO settings Proposal', async ({
  context,
  page,
  extensionId,
  metamask,
}) => {
  await page.goto(`${LOCALHOST_URL}/`);
  await page.getByRole('button', {name: 'Accept all'}).click();
  await page.getByRole('button', {name: 'Connect wallet'}).click();
  await page.getByRole('button', {name: 'MetaMask MetaMask'}).nth(0).click();
  await metamask.connectToDapp();
  await page.getByRole('radio', {name: 'Member'}).click();
  await page.locator('[id="radix-\\:r16\\:"]').click();
  await page.getByText('Sort by recently created').click();
  await page
    .getByRole('link', {
      name: 'TB Token Based DAO (governance incompatible token) DAO generated by automated',
    })
    .first()
    .click();
  await page
    .getByTestId('navLinks')
    .getByRole('button', {name: 'Settings'})
    .click();
  await page
    .getByTestId('header-page')
    .getByRole('button', {name: 'Edit settings'})
    .click();
  await page.getByRole('button', {name: 'Switch to Ethereum Sepolia'}).click();
  await metamask.approveSwitchNetwork();
  await page.waitForTimeout(1000);
  await page.getByRole('button', {name: 'Add link'}).click();

  await page.getByPlaceholder('Lens').click();
  await page.getByPlaceholder('Lens').fill('Token Based DAO');
  await page.getByPlaceholder('Lens').click();
  await page
    .getByPlaceholder('https://')
    .fill(
      'https://app.aragon.org/#/daos/sepolia/0x186b0505e1a8fe74c59103f50690dff29e6c39bd/dashboard'
    );
  await page.getByRole('button', {name: 'Review proposal'}).click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByPlaceholder('Give your proposal a title').click();
  await page
    .getByPlaceholder('Give your proposal a title')
    .fill('Edit settings');
  await page.getByPlaceholder('Describe your proposal in 2-3').click();
  await page
    .getByPlaceholder('Describe your proposal in 2-3')
    .fill('Edit settings');
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Publish proposal'}).click();
  await page.getByRole('button', {name: 'Create proposal'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Open your proposal'}).click();
  await page.getByRole('button', {name: 'Vote now'}).click();
  await page.getByText('YesYour choice will be').click();
  await page.getByRole('button', {name: 'Submit your vote'}).click();
  await page.getByRole('button', {name: 'Vote now'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Open your proposal'}).click();
  await page.getByRole('button', {name: 'Execute now'}).click();
  await page.getByRole('button', {name: 'Execute now'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Open your proposal'}).click();
});
