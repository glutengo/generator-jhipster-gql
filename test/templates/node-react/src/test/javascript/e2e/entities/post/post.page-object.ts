import { element, by, ElementFinder, ElementArrayFinder } from 'protractor';

import { waitUntilAnyDisplayed, waitUntilDisplayed, click, waitUntilHidden, isVisible } from '../../util/utils';

import NavBarPage from './../../page-objects/navbar-page';

import PostUpdatePage from './post-update.page-object';

const expect = chai.expect;
export class PostDeleteDialog {
  deleteModal = element(by.className('modal'));
  private dialogTitle: ElementFinder = element(by.id('newsApp.post.delete.question'));
  private confirmButton = element(by.id('jhi-confirm-delete-post'));

  getDialogTitle() {
    return this.dialogTitle;
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}

export default class PostComponentsPage {
  createButton: ElementFinder = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('div table .btn-danger'));
  title: ElementFinder = element(by.id('post-heading'));
  noRecords: ElementFinder = element(by.css('#app-view-container .table-responsive div.alert.alert-warning'));
  table: ElementFinder = element(by.css('#app-view-container div.table-responsive > table'));

  records: ElementArrayFinder = this.table.all(by.css('tbody tr'));

  getDetailsButton(record: ElementFinder) {
    return record.element(by.css('a.btn.btn-info.btn-sm'));
  }

  getEditButton(record: ElementFinder) {
    return record.element(by.css('a.btn.btn-primary.btn-sm'));
  }

  getDeleteButton(record: ElementFinder) {
    return record.element(by.css('a.btn.btn-danger.btn-sm'));
  }

  async goToPage(navBarPage: NavBarPage) {
    await navBarPage.getEntityPage('post');
    await waitUntilAnyDisplayed([this.noRecords, this.table]);
    return this;
  }

  async goToCreatePost() {
    await this.createButton.click();
    return new PostUpdatePage();
  }

  async deletePost() {
    const deleteButton = this.getDeleteButton(this.records.last());
    await click(deleteButton);

    const postDeleteDialog = new PostDeleteDialog();
    await waitUntilDisplayed(postDeleteDialog.deleteModal);
    expect(await postDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/newsApp.post.delete.question/);
    await postDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(postDeleteDialog.deleteModal);

    expect(await isVisible(postDeleteDialog.deleteModal)).to.be.false;
  }
}
