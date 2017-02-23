/**
 * selectors.ts
 *
 * Created by Zander Otavka on 2/20/17.
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

import {createSelector} from "reselect"

import {FullArticleModel, StateModel} from "./models"

const getPublicationsById = (state: StateModel) => state.publicationsById
const getArticlesById = (state: StateModel) => state.articlesById
const getSelectedArticle = (state: StateModel, {articleId}: {articleId?: string}) =>
    state.articlesById[articleId]

export const getPublications = createSelector(
    getPublicationsById,
    publicationsById => Object.keys(publicationsById)
        .map(id => publicationsById[id])
        .sort((a, b) => a.name.localeCompare(b.name))
)

export const getArticles = createSelector(
    getArticlesById,
    articlesById => Object.keys(articlesById)
        .map(id => articlesById[id])
        .sort((a, b) => a.datePublished.valueOf() - b.datePublished.valueOf())
)

export const getDefaultPublicationId = createSelector(
    getPublications,
    publications => publications[0] ? publications[0].id : ""
)

const defaultFullArticle: FullArticleModel = {
    id: "",
    publication: "",
    title: "",
    content: "",
    brief: "",
    authors: [{name: "", email: ""}],
    headerImage: "",
    dateEdited: new Date(0),
    datePublished: new Date(0),
}

export const getSelectedEditArticle = createSelector(
    getSelectedArticle,
    (selectedArticle): FullArticleModel => ({
        ...defaultFullArticle,
        ...(selectedArticle || {}),
    })
)
