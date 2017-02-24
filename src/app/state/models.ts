/**
 * models.ts
 *
 * Created by Zander Otavka on 2/8/17.
 * Copyright (C) 2016  Grinnell AppDev.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {RouterState} from "react-router-redux"

export interface AuthorModel {
    readonly name: string
    readonly email: string
}

export interface ArticleBriefModel {
    readonly id: string
    readonly publication: string
    readonly datePublished: Date
    readonly headerImage?: string
    readonly title: string
    readonly brief?: string
}

export interface FullArticleModel extends ArticleBriefModel {
    readonly dateEdited: Date
    readonly authors: AuthorModel[]
    readonly content: string
}

export interface ArticleEditModel {
    readonly content?: string
    readonly headerImage?: string
    readonly title?: string
    readonly brief?: string
    readonly authors?: AuthorModel[]
}

export interface PublicationModel {
    readonly id: string
    readonly name: string
}

export interface IdMapModel<T> {
    readonly [id: string]: T
}

export enum SubmissionStateModel {
    EDITING,
    SUBMITTING,
    ERRORED,
}

export enum ToastActionTypeModel {
    DELETE_REMOTE_ARTICLE,
    UNDELETE_ARTICLE,
}

export interface ToastActionModel {
    readonly type: ToastActionTypeModel
    readonly args: ReadonlyArray<any>
}

export interface ToastButtonModel {
    readonly text: string
    readonly action: ToastActionModel
}

export interface ToastModel {
    readonly id: string
    readonly timeCreated: Date
    readonly duration: number
    readonly text: string
    readonly expireAction: ToastActionModel
    readonly cancelAction: ToastActionModel
    readonly buttons: ReadonlyArray<ToastButtonModel>
}

export interface StateModel {
    readonly publicationsById: IdMapModel<PublicationModel>
    readonly articlesById: IdMapModel<ArticleBriefModel>
    readonly articleDraftsById: IdMapModel<ArticleEditModel>

    readonly didInitialLoad: boolean
    readonly isLoadingPublications: boolean
    readonly loadingPublications: ReadonlyArray<string>
    readonly loadingArticles: ReadonlyArray<string>

    readonly articleDraftSubmissionState: SubmissionStateModel

    readonly toasts: ReadonlyArray<ToastModel>

    readonly routing: RouterState
}
