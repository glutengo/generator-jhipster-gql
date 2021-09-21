<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" role="form" novalidate v-on:submit.prevent="save()">
        <h2 id="newsApp.post.home.createOrEditLabel" data-cy="PostCreateUpdateHeading" v-text="$t('newsApp.post.home.createOrEditLabel')">
          Create or edit a Post
        </h2>
        <div>
          <div class="form-group" v-if="post.id">
            <label for="id" v-text="$t('global.field.id')">ID</label>
            <input type="text" class="form-control" id="id" name="id" v-model="post.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="$t('newsApp.post.title')" for="post-title">Title</label>
            <input
              type="text"
              class="form-control"
              name="title"
              id="post-title"
              data-cy="title"
              :class="{ valid: !$v.post.title.$invalid, invalid: $v.post.title.$invalid }"
              v-model="$v.post.title.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="$t('newsApp.post.content')" for="post-content">Content</label>
            <input
              type="text"
              class="form-control"
              name="content"
              id="post-content"
              data-cy="content"
              :class="{ valid: !$v.post.content.$invalid, invalid: $v.post.content.$invalid }"
              v-model="$v.post.content.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="$t('newsApp.post.coverImageUrl')" for="post-coverImageUrl">Cover Image Url</label>
            <input
              type="text"
              class="form-control"
              name="coverImageUrl"
              id="post-coverImageUrl"
              data-cy="coverImageUrl"
              :class="{ valid: !$v.post.coverImageUrl.$invalid, invalid: $v.post.coverImageUrl.$invalid }"
              v-model="$v.post.coverImageUrl.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="$t('newsApp.post.author')" for="post-author">Author</label>
            <select class="form-control" id="post-author" data-cy="author" name="author" v-model="post.author">
              <option v-bind:value="null"></option>
              <option
                v-bind:value="post.author && userOption.id === post.author.id ? post.author : userOption"
                v-for="userOption in users"
                :key="userOption.id"
              >
                {{ userOption.login }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <button type="button" id="cancel-save" class="btn btn-secondary" v-on:click="previousState()">
            <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="$t('entity.action.cancel')">Cancel</span>
          </button>
          <button
            type="submit"
            id="save-entity"
            data-cy="entityCreateSaveButton"
            :disabled="$v.post.$invalid || isSaving"
            class="btn btn-primary"
          >
            <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="$t('entity.action.save')">Save</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts" src="./post-update.component.ts"></script>
