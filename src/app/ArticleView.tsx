/**
 * ArticleView.tsx
 *
 * Created by Zander Otavka on 2/8/16.
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

import * as React from "react"
import {Link} from "react-router"

import {ArticleBriefModel} from "./state/models"

import block from "./style/bem"

import "./ArticleView.scss"

interface Props {
    model: ArticleBriefModel
    onDelete: (id: string) => void
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sep", "Oct",
                      "Nov", "Dec"]

export default function ArticleView({model, onDelete}: Props): JSX.Element {
    const b = block("ArticleView")

    return (
        <article className={b()}>
            <div className={b("header-image-wrapper")}>
                <div className={b("header-image-container")}>
                    <img className={b("header-image")} src={model.headerImage || ""}/>
                </div>
            </div>
            <section className={b("detail-wrapper")}>
                <h2 className={b("title")}>{model.title}</h2>

                <div>
                    <Link to={`/publications/${model.publication}/articles/${model.id}/edit`}>
                        <button>Edit</button>
                    </Link>
                    <button onClick={() => onDelete(model.id)}>Delete</button>
                </div>

                <div>
                    <span className={b("date")}>
                        {SHORT_MONTHS[model.datePublished.getMonth()]}
                        {" "}
                        {model.datePublished.getDate()}
                    </span>
                    {model.brief ? " • " + model.brief : ""}
                </div>
            </section>
        </article>
    )
}
