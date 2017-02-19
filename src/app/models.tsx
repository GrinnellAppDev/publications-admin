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

export interface PublicationModel {
    id: string
    name: string
}
