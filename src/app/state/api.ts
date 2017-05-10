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

import {stringify as stringifyQuery} from "query-string"

import {PublicationModel, FullArticleModel, ArticleCreateModel, ArticleEditModel, ShortArticleModel,
        AuthorModel} from "./models"
import createErrorClass, {CustomError} from "./createErrorClass"

const API_ROOT = process.env.API_ROOT

export interface PaginatedArray<T> {
    readonly nextPageToken?: string
    readonly items: ReadonlyArray<T>
}

export namespace PaginatedArray {
    export const LAST_PAGE_TOKEN = ""
}

export interface FetchErrorPayload {
    resp?: Response
}

export type FetchError = CustomError<FetchErrorPayload>
export const FetchError = createErrorClass<FetchErrorPayload>(
    "FETCH_ERROR",
    (message, {resp}) => (resp) ? (
        `Fetch errored with code: ${resp.status} - ${resp.statusText}. ${message}`
    ) : (
        `Fetch errored. ${message}`
    )
)

function toFetchError(err: any): FetchError {
    if (FetchError.isTypeOf(err)) {
        return err
    } else if (err instanceof TypeError) {
        return new FetchError(err.message, {})
    } else {
        return new FetchError("", {})
    }
}

function responseToArray<T>(elementConversion: (element: any) => T, request: any): T[] {
    return (request as any[]).map(elementConversion)
}

function responseToPaginatedArray<T>(elementConversion: (element: any) => T,
                                     response: any): PaginatedArray<T> {
    return {
        items: responseToArray(elementConversion, response.items),
        nextPageToken: response.nextPageToken || PaginatedArray.LAST_PAGE_TOKEN
    }
}

function responseToPublicationModel(response: any): PublicationModel {
    return {...response as PublicationModel}
}

function responseToArticleModel(response: any): FullArticleModel {
    return {
        ...response as FullArticleModel,
        dateEdited: new Date(response.dateEdited),
        datePublished: new Date(response.datePublished),
    }
}

function responseToShortArticleModel(response: any): ShortArticleModel {
    return {
        ...response as ShortArticleModel,
        datePublished: new Date(response.datePublished),
    }
}

function arrayToRequest<T>(elementConversion: (element: T) => any, array: T[]): any {
    return array.map(elementConversion).filter((element) => element !== undefined)
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

export default {
    publications: {
        async list(pageToken: string | null): Promise<PaginatedArray<PublicationModel>> {
            if (pageToken === PaginatedArray.LAST_PAGE_TOKEN) {
                return {
                    items: [],
                    nextPageToken: PaginatedArray.LAST_PAGE_TOKEN,
                }
            }

            try {
                const params = stringifyQuery({
                    pageToken: pageToken || undefined,
                    pageSize: 100,  // ask for large page to minimize the number of requests
                })

                const resp = await fetch(`${API_ROOT}/publications?${params}`, {
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
        async list(publicationId: string,
                   pageToken: string | null): Promise<PaginatedArray<ShortArticleModel>> {
            if (pageToken === PaginatedArray.LAST_PAGE_TOKEN) {
                return {
                    items: [],
                    nextPageToken: PaginatedArray.LAST_PAGE_TOKEN,
                }
            }

            try {
                const params = stringifyQuery({
                    pageToken: pageToken || undefined,
                })

                const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles` +
                                         `?${params}`, {
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

        async get(publicationId: string, articleId: string): Promise<FullArticleModel> {
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

        async remove(publicationId: string, articleId: string, authToken: string): Promise<void> {
            try {
                const headers = new Headers()
                headers.append("Authorization", authToken)

                const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                         `${articleId}`, {
                    method: "DELETE",
                    mode: "cors",
                    headers,
                })

                if (!resp.ok) {
                    throw new FetchError("", {resp})
                }
            } catch (err) {
                throw toFetchError(err)
            }
        },

        async create(publicationId: string, model: ArticleCreateModel,
                     authToken: string): Promise<FullArticleModel> {
            try {
                const headers = new Headers()
                headers.append("Authorization", authToken)

                const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles`, {
                    method: "POST",
                    mode: "cors",
                    headers,
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

        async edit(publicationId: string, articleId: string, model: ArticleEditModel,
                   authToken: string): Promise<FullArticleModel> {
            try {
                const headers = new Headers()
                headers.append("Authorization", authToken)

                const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                         `${articleId}`, {
                    method: "PATCH",
                    mode: "cors",
                    headers,
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
