/**
 * api.tsx
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

/// <reference types="whatwg-fetch" />

import {ArticleModel, ArticleEditModel, PublicationModel} from "./models";

declare const process: any;
const API_ROOT: string = process.env.API_ROOT;

function checkResponse(resp: Response): Response {
    if (resp.ok) {
        return resp;
    } else {
        throw new Error("Fetch error.");
    }
}

export default {
    publications: {
        list(): Promise<PublicationModel[]> {
            return fetch(`${API_ROOT}/publications`, {
                method: "GET",
                mode: "cors",
            })
                .then(checkResponse)
                .then(resp => resp.json())
                .then((data: any) => {
                    return data as PublicationModel[];
                });
        },
    },

    articles: {
        list(publicationId: string): Promise<ArticleModel[]> {
            return fetch(`${API_ROOT}/publications/${publicationId}/articles`, {
                method: "GET",
                mode: "cors",
            })
                .then(checkResponse)
                .then(resp => resp.json())
                .then((data: any) => {
                    return data as ArticleModel[];
                });
        },

        get(publicationId: string, articleId: string): Promise<ArticleModel> {
            return fetch(`${API_ROOT}/publications/${publicationId}/articles/${articleId}`, {
                method: "GET",
                mode: "cors",
            })
                .then(checkResponse)
                .then(resp => resp.json())
                .then((data: any) => {
                    return data as ArticleModel;
                });
        },

        remove(publicationId: string, articleId: string): Promise<void> {
            return fetch(`${API_ROOT}/publications/${publicationId}/articles/${articleId}`, {
                method: "DELETE",
                mode: "cors",
            })
                .then(checkResponse)
                .then(() => undefined);
        },

        create(publicationId: string, model: ArticleEditModel): Promise<void> {
            return fetch(`${API_ROOT}/publications/${publicationId}/articles`, {
                method: "POST",
                mode: "cors",
                body: JSON.stringify(model),
            })
                .then(checkResponse)
                .then(() => undefined);
        },

        edit(publicationId: string, articleId: string, model: ArticleEditModel): Promise<void> {
            return fetch(`${API_ROOT}/publications/${publicationId}/articles/${articleId}`, {
                method: "PATCH",
                mode: "cors",
                body: JSON.stringify(model),
            })
                .then(checkResponse)
                .then(() => undefined);
        },
    },
};
