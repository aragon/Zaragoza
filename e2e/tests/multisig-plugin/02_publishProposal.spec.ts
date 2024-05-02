import {LOCALHOST_URL} from '../../basic.setup';
import {testWithMetaMask as test} from '../../testWithMetaMask';

// Test is publishing a signaling Proposal and voting on it
test('Publish signaling Proposal', async ({
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
    .getByRole('link', {name: 'MD Multisig DAO DAO generated'})
    .first()
    .click();
  await page
    .getByRole('button', {name: /New proposal|Create proposal/})
    .click();
  await page.getByRole('button', {name: 'Switch to Ethereum Sepolia'}).click();
  await metamask.approveSwitchNetwork();
  await page.waitForTimeout(1000);
  await page.getByPlaceholder('Give your proposal a title').click();
  await page
    .getByPlaceholder('Give your proposal a title')
    .fill('Create signaling proposal');
  await page.getByPlaceholder('Describe your proposal in 2-3').click();
  await page
    .getByPlaceholder('Describe your proposal in 2-3')
    .fill('Create signaling proposal');
  await page.locator('.tiptap').click();
  await page.locator('.tiptap').fill('Create signaling proposal');
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Publish proposal'}).click();
  await page.getByRole('button', {name: 'Create proposal'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Open your proposal'}).click();
  await page.getByRole('button', {name: 'Approve'}).click();
  await page.getByRole('button', {name: 'Approve'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Continue to proposal'}).click();
});
