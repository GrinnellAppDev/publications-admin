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

import {ArticleModel, ArticleEditModel, ArticleBriefModel, PublicationModel,
        conversions as conv} from "./models";

const API_ROOT: string = process.env.API_ROOT;

class FetchError extends Error {
    isFetchError: boolean = true;
    status: number;

    constructor(resp: Response) {
        super(`Fetch errored with code: ${resp.status} - ${resp.statusText}`);
        this.status = resp.status;
    }
}

export default {
    publications: {
        async list(): Promise<PublicationModel[]> {
            const resp = await fetch(`${API_ROOT}/publications`, {
                method: "GET",
                mode: "cors",
            });

            if (!resp.ok) {
                throw new FetchError(resp);
            }

            return conv.requestToArray(conv.requestToPublicationModel, await resp.json());
        },
    },

    articles: {
        async list(publicationId: string): Promise<ArticleBriefModel[]> {
            const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles`, {
                method: "GET",
                mode: "cors",
            });

            if (!resp.ok) {
                throw new FetchError(resp);
            }

            return conv.requestToArray(conv.requestToArticleBriefModel, await resp.json());
        },

        async get(publicationId: string, articleId: string): Promise<ArticleModel> {
            const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                     `${articleId}`, {
                method: "GET",
                mode: "cors",
            });

            if (!resp.ok) {
                throw new FetchError(resp);
            }

            return conv.requestToArticleModel(await resp.json());
        },

        async remove(publicationId: string, articleId: string): Promise<void> {
            const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                     `${articleId}`, {
                method: "DELETE",
                mode: "cors",
            });

            if (!resp.ok) {
                throw new FetchError(resp);
            }
        },

        async create(publicationId: string, model: ArticleEditModel): Promise<void> {
            const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles`, {
                method: "POST",
                mode: "cors",
                body: JSON.stringify(conv.articleEditModelToRequest(model)),
            });

            if (!resp.ok) {
                throw new FetchError(resp);
            }
        },

        async edit(publicationId: string, articleId: string,
                   model: ArticleEditModel): Promise<void> {
            const resp = await fetch(`${API_ROOT}/publications/${publicationId}/articles/` +
                                     `${articleId}`, {
                method: "PATCH",
                mode: "cors",
                body: JSON.stringify(conv.articleEditModelToRequest(model)),
            });

            if (!resp.ok) {
                throw new FetchError(resp);
            }
        },
    },
};
