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

import {ArticleModel, ArticleEditModel, PublicationModel} from "./models";

// declare const process: any;
// const API_ROOT: string = process.env.API_ROOT;

const EXAMPLE_PUBLICATIONS = [
    {
        id: "s&b",
        name: "Scarlett and Black",
    },
];

const EXAMPLE_ARTICLES = [
    {
        id: "a",
        publicationId: "s&b",
        content: "I am an article",
        title: "My Article",
    },
    {
        id: "b",
        publicationId: "s&b",
        content: "I am a different, sensationalist article",
        title: "Badly Written Article",
    }
];

export default {
    publications: {
        list(): Promise<PublicationModel[]> {
            return Promise.resolve(EXAMPLE_PUBLICATIONS);
        },
    },

    articles: {
        list(publicationId: string): Promise<ArticleModel[]> {
            return Promise.resolve(EXAMPLE_ARTICLES);
        },

        get(publicationId: string, articleId: string): Promise<ArticleModel> {
            return Promise.resolve(EXAMPLE_ARTICLES.find(a => a.id === articleId));
        },

        remove(publicationId: string, articleId: string): Promise<void> {
            // return fetch(`${API_ROOT}/publications/`);
            return Promise.resolve();
        },

        create(publicationId: string, model: ArticleEditModel): Promise<void> {
            return Promise.resolve();
        },

        edit(publicationId: string, articleId: string, model: ArticleEditModel): Promise<void> {
            return Promise.resolve();
        },
    },
};
