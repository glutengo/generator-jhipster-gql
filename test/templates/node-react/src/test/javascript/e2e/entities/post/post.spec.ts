import { browser, element, by } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import PostComponentsPage from './post.page-object';
import PostUpdatePage from './post-update.page-object';
import {
  waitUntilDisplayed,
  waitUntilAnyDisplayed,
  click,
  getRecordsCount,
  waitUntilHidden,
  waitUntilCount,
  isVisible,
} from '../../util/utils';

const expect = chai.expect;

describe('Post e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let postComponentsPage: PostComponentsPage;
  let postUpdatePage: PostUpdatePage;
  const username = process.env.E2E_USERNAME ?? 'admin';
  const password = process.env.E2E_PASSWORD ?? 'admin';

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.waitUntilDisplayed();
    await signInPage.username.sendKeys(username);
    await signInPage.password.sendKeys(password);
    await signInPage.loginButton.click();
    await signInPage.waitUntilHidden();
    await waitUntilDisplayed(navBarPage.entityMenu);
    await waitUntilDisplayed(navBarPage.adminMenu);
    await waitUntilDisplayed(navBarPage.accountMenu);
  });

  beforeEach(async () => {
    await browser.get('/');
    await waitUntilDisplayed(navBarPage.entityMenu);
    postComponentsPage = new PostComponentsPage();
    postComponentsPage = await postComponentsPage.goToPage(navBarPage);
  });

  it('should load Posts', async () => {
    expect(await postComponentsPage.title.getText()).to.match(/Posts/);
    expect(await postComponentsPage.createButton.isEnabled()).to.be.true;
  });

  it('should create and delete Posts', async () => {
    const beforeRecordsCount = (await isVisible(postComponentsPage.noRecords)) ? 0 : await getRecordsCount(postComponentsPage.table);
    postUpdatePage = await postComponentsPage.goToCreatePost();
    await postUpdatePage.enterData();

    expect(await postComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilDisplayed(postComponentsPage.table);
    await waitUntilCount(postComponentsPage.records, beforeRecordsCount + 1);
    expect(await postComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);

    await postComponentsPage.deletePost();
    if (beforeRecordsCount !== 0) {
      await waitUntilCount(postComponentsPage.records, beforeRecordsCount);
      expect(await postComponentsPage.records.count()).to.eq(beforeRecordsCount);
    } else {
      await waitUntilDisplayed(postComponentsPage.noRecords);
    }
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
