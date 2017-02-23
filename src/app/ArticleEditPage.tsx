/**
 * ArticleEditPage.tsx
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

import {RouteComponentProps} from "react-router"
import {connect} from "react-redux"

import {StateModel} from "./state/models"
import {getSelectedEditArticle} from "./state/selectors"

import ArticleEditForm, {StateProps, DispatchProps} from "./ArticleEditForm"

interface RouteParams {
    publicationId: string
    articleId?: string
}

interface OwnProps extends RouteComponentProps<RouteParams, {}> {
}

const withReduxConnect = connect<StateProps, DispatchProps, OwnProps>(
    (state: StateModel, {params}) => ({
        model: getSelectedEditArticle(state, params),
        isLoading: state.loadingArticles.includes(params.articleId),
        submissionState: state.editSubmissionState,
        publicationId: params.publicationId,
    }),

    (dispatch, {params}) => ({
        onAuthorAdd: () => {
            return
        },
        onAuthorChange: () => {
            return
        },
        onAuthorRemove: () => {
            return
        },
        onBriefChange: () => {
            return
        },
        onContentChange: () => {
            return
        },
        onHeaderImageChange: () => {
            return
        },
        onSubmit: () => {
            return
        },
        onTitleChange: () => {
            return
        }
    })
)

export default withReduxConnect(ArticleEditForm)

/*
interface State {
    model: FullArticleModel
    isLoading: boolean
    submissionState: SubmissionState
}

export default class ArticleEditPage extends React.PureComponent<Props, State> {
    state: State = {
        isLoading: false,
        submissionState: SubmissionState.EDITING,
        model: {
            id: "",
            publication: "",
            title: "",
            content: "",
            brief: "",
            authors: [{name: "", email: ""}],
            headerImage: "",
            dateEdited: new Date(),
            datePublished: new Date(),
        },
    }

    async componentDidMount(): Promise<void> {
        const {params} = this.props
        this.setState({submissionState: SubmissionState.EDITING})

        if (params.articleId) {
            this.setState({isLoading: true})
            this.setState({
                model: await api.articles.get(params.publicationId, params.articleId),
                isLoading: false,
            })
        }
    }

    private onTitleChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        const title = ev.target.value
        this.setState(({model}) => ({
            model: {...model, title},
        }))
    }

    private onHeaderImageChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        const headerImage = ev.target.value
        this.setState(({model}) => ({
            model: {...model, headerImage},
        }))
    }

    private onAuthorAdd = (ev: React.MouseEvent<HTMLButtonElement>): void => {
        ev.preventDefault()
        this.setState(({model}) => ({
            model: {
                ...model,
                authors: [...model.authors, {name: "", email: ""}],
            },
        }))
    }

    private onAuthorChange = (newAuthorIndex: number, newAuthor: AuthorModel): void => {
        this.setState(({model}) => ({
            model: {
                ...model,
                authors: model.authors.map((author, index) =>
                    (index === newAuthorIndex) ? newAuthor : author
                ),
            },
        }))
    }

    private onAuthorRemove = (removeIndex: number): void => {
        this.setState(({model}) => ({
            model: {
                ...model,
                authors: model.authors.filter((author, index) => index !== removeIndex),
            },
        }))
    }

    private onBriefChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        const brief = ev.target.value
        this.setState(({model}) => ({
            model: {...model, brief},
        }))
    }

    private onContentChange = (ev: React.ChangeEvent<HTMLTextAreaElement>): void => {
        const content = ev.target.value
        this.setState(({model}) => ({
            model: {...model, content},
        }))
    }

    private onSubmit = async (ev: React.FormEvent<HTMLFormElement>): Promise<void> => {
        ev.preventDefault()

        this.setState({submissionState: SubmissionState.SUBMITTING})

        const {params, router} = this.props
        const model = {
            ...this.state.model,
            authors: this.state.model.authors.filter(author => author.name || author.email),
        }

        try {
            if (model.id) {
                await api.articles.edit(params.publicationId, model.id, model)
            } else {
                await api.articles.create(params.publicationId, model)
            }

            router.goBack()
        } catch (err) {
            this.setState({submissionState: SubmissionState.ERRORED})
        }
    }

    render(): JSX.Element {
        const {params} = this.props
        const {model, isLoading, submissionState} = this.state
        return <ArticleEditForm
            {...{model, isLoading, submissionState}} publicationId={params.publicationId}
            onTitleChange={this.onTitleChange} onHeaderImageChange={this.onHeaderImageChange}
            onAuthorAdd={this.onAuthorAdd} onAuthorChange={this.onAuthorChange}
            onAuthorRemove={this.onAuthorRemove} onBriefChange={this.onBriefChange}
            onContentChange={this.onContentChange} onSubmit={this.onSubmit}/>
    }
}
*/
