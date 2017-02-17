/**
 * models.tsx
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

export interface PublicationModel {
    id: string
    name: string
}

export interface AuthorModel {
    name: string
    email: string
}

export interface ArticleBriefModel {
    id: string
    publication: string
    datePublished: Date
    headerImage: string
    title: string
    brief: string
}

export interface ArticleEditModel {
    content: string
    headerImage: string
    title: string
    brief: string
    authors: AuthorModel[]
}

export interface ArticleModel extends ArticleEditModel, ArticleBriefModel {
    dateEdited: Date
}

function requestToArray<T>(elementConversion: (element: any) => T, request: any): T[] {
    return (request as any[]).map(elementConversion)
}

function requestToPublicationModel(request: any): PublicationModel {
    return {...request as PublicationModel}
}

function requestToArticleModel(request: any): ArticleModel {
    return {
        ...request as ArticleModel,
        dateEdited: new Date(request.dateEdited),
        datePublished: new Date(request.datePublished),
    }
}

function requestToArticleBriefModel(request: any): ArticleBriefModel {
    return {
        ...request as ArticleBriefModel,
        datePublished: new Date(request.datePublished),
    }
}

function arrayToRequest<T>(elementConversion: (element: T) => any, array: T[]): any {
    return array.map(elementConversion).filter(element => element !== undefined)
}

function authorModelToRequest(model: AuthorModel): any {
    const {name, email} = model
    return {name, email}
}

function articleEditModelToRequest(model: ArticleEditModel): any {
    const {content, title, authors, headerImage, brief} = model
    return {
        authors: arrayToRequest(authorModelToRequest, authors),
        content, title, headerImage, brief,
    }
}

export const conversions = {
    requestToArray,
    requestToPublicationModel,
    requestToArticleModel,
    requestToArticleBriefModel,
    arrayToRequest,
    authorModelToRequest,
    articleEditModelToRequest,
}
