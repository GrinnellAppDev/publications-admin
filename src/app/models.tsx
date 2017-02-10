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
    id: string;
    name: string;
}

export interface ArticleEditModel {
    content: string;
    title: string;
    authorName: string;
    authorEmail: string;
}

export interface ArticleModel extends ArticleEditModel {
    id: string;
    publication: string;
    datePublished: Date;
    dateEdited: Date;
}

export const conversions = {
    requestToArray<T>(elementConversion: (element: any) => T, request: any): T[] {
        return (request as any[]).map(elementConversion);
    },

    requestToPublicationModel(request: any): PublicationModel {
        return {...request as PublicationModel};
    },

    requestToArticleModel(request: any): ArticleModel {
        return {
            ...request as ArticleModel,
            dateEdited: new Date(request.dateEdited),
            datePublished: new Date(request.datePublished),
        };
    },

    articleEditModelToRequest(model: ArticleEditModel): any {
        const {content, title, authorEmail, authorName} = model;
        return {content, title, authorEmail, authorName};
    },
};
