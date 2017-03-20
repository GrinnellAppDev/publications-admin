/**
 * api.ts
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

import {PublicationModel, FullArticleModel, ArticleCreateModel, ArticleEditModel, ShortArticleModel,
        AuthorModel} from "./models"
import createErrorClass from "./createErrorClass"

const API_ROOT = process.env.API_ROOT

export interface PaginatedArray<T> {
    readonly nextPageToken?: string
    readonly items: ReadonlyArray<T>
}

export interface FetchErrorPayload {
    resp?: Response
}

export const FetchError = createErrorClass<FetchErrorPayload>(
    "FETCH_ERROR",
    (message, {resp}) => (resp) ? (
        `Fetch errored with code: ${resp.status} - ${resp.statusText}. ${message}`
    ) : (
        `Fetch errored. ${message}`
    )
)

function toFetchError(err: any): any {
    if (err instanceof TypeError) {
        return new FetchError(err.message, {})
    } else {
        return err
    }
}

function responseToArray<T>(elementConversion: (element: any) => T, request: any): T[] {
    return (request as any[]).map(elementConversion)
}

function responseToPaginatedArray<T>(elementConversion: (element: any) => T,
                                    request: any): PaginatedArray<T> {
    return {
        nextPageToken: request.nextPageToken,
        items: responseToArray(elementConversion, request.items),
    }
}

function responseToPublicationModel(request: any): PublicationModel {
    return {...request as PublicationModel}
}

function responseToArticleModel(request: any): FullArticleModel {
    return {
        ...request as FullArticleModel,
        dateEdited: new Date(request.dateEdited),
        datePublished: new Date(request.datePublished),
    }
}

function responseToShortArticleModel(request: any): ShortArticleModel {
    return {
        ...request as ShortArticleModel,
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
    const {content, title, authors, headerImage} = model
    return {
        authors: arrayToRequest(authorModelToRequest, authors),
        content, title, headerImage,
    }
}

export interface Api {
    publications: {
        list(pageToken: string): Promise<PaginatedArray<PublicationModel>>
    }

    articles: {
        list(publicationId: string, pageToken: string): Promise<PaginatedArray<ShortArticleModel>>
        get(publicationId: string, articleId: string): Promise<FullArticleModel>
        remove(publicationId: string, articleId: string): Promise<void>
        create(publicationId: string, model: ArticleCreateModel): Promise<FullArticleModel>
        edit(publicationId: string, articleId: string,
             model: ArticleEditModel): Promise<FullArticleModel>
    }
}

export const api: Api = {
    publications: {
        list: async pageToken => {
            try {
                const params = pageToken ? `?pageToken=${pageToken}` : ""
                const resp = await fetch(`${API_ROOT}/publications${params}`, {
                    method: "GET",
                    mode: "cors",
                })

                if (!resp.ok) {
                    throw new FetchError("", {resp})
                }

                return responseToPaginatedArray(responseToPublicationModel, await resp.json())
            } catch (err) {
                throw toFetchError(err)
            }
        },
    },

    articles: {
        list: async (publicationId, pageToken) => {
            try {
                const params = pageToken ? `?pageToken=${pageToken}` : ""
                const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles` +
                                         `${params}`, {
                    method: "GET",
                    mode: "cors",
                })

                if (!resp.ok) {
                    throw new FetchError("", {resp})
                }

                return responseToPaginatedArray(responseToShortArticleModel, await resp.json())
            } catch (err) {
                throw toFetchError(err)
            }
        },

        get: async (publicationId, articleId) => {
            try {
                const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                         `${articleId}`, {
                    method: "GET",
                    mode: "cors",
                })

                if (!resp.ok) {
                    throw new FetchError("", {resp})
                }

                return responseToArticleModel(await resp.json())
            } catch (err) {
                throw toFetchError(err)
            }
        },

        remove: async (publicationId, articleId) => {
            try {
                const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                         `${articleId}`, {
                    method: "DELETE",
                    mode: "cors",
                })

                if (!resp.ok) {
                    throw new FetchError("", {resp})
                }
            } catch (err) {
                throw toFetchError(err)
            }
        },

        create: async (publicationId, model) => {
            try {
                const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles`, {
                    method: "POST",
                    mode: "cors",
                    body: JSON.stringify(articleEditModelToRequest(model)),
                })

                if (!resp.ok) {
                    throw new FetchError("", {resp})
                }

                return responseToArticleModel(await resp.json())
            } catch (err) {
                throw toFetchError(err)
            }
        },

        edit: async (publicationId, articleId, model) => {
            try {
                const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                         `${articleId}`, {
                    method: "PATCH",
                    mode: "cors",
                    body: JSON.stringify(articleEditModelToRequest(model)),
                })

                if (!resp.ok) {
                    throw new FetchError("", {resp})
                }

                return responseToArticleModel(await resp.json())
            } catch (err) {
                throw toFetchError(err)
            }
        },
    },
}
