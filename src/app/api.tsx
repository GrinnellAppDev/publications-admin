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

import {ArticleModel, ArticleEditModel} from "./models";

export default {
    articles: {
        list(): Promise<ArticleModel[]> {
            return Promise.resolve([
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
            ]);
        },

        remove(id: string): Promise<void> {
            return Promise.resolve();
        },

        create(model: ArticleEditModel): Promise<void> {
            return Promise.resolve();
        },

        edit(id: string, model: ArticleEditModel): Promise<void> {
            return Promise.resolve();
        },
    },
};
