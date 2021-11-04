import {render, screen} from '@testing-library/react';
import { getPrismicClient } from '../../services/prismic';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { mocked } from 'ts-jest/utils';
import { getSession, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

jest.mock('../../services/prismic')
jest.mock('next-auth/client')
jest.mock('next/router')

const post = { 
    slug: 'my-new-post', 
    title: 'My New Post', 
    content: '<p>Post content</p>', 
    updatedAt: '10 de Abril'
};

describe('Post page', () => {
    it('render correctly', () => {
        const useSessionMocked = mocked(useSession);

        useSessionMocked.mockReturnValueOnce([null, false]);

        render(<Post post={post} />)

        expect(screen.getByText('My New Post')).toBeInTheDocument();
        expect(screen.getByText('Post content')).toBeInTheDocument();
        expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
    })

    it('redirects user to full post when user has active subscription', async () => {
        const useSessionMocked = mocked(useSession);
        const useRouterMocked = mocked(useRouter);

        useSessionMocked.mockReturnValueOnce([{
            activeSubscription: 'fake-active-subscription'
        }, false] as any);

        const mockedPush = jest.fn();

        useRouterMocked.mockReturnValueOnce({
            push: mockedPush,
        } as any);

        render(<Post post={post} />)

        expect(mockedPush).toHaveBeenCalledWith('/posts/my-new-post');
    });

    it('load initial data', async () => {
        const mockedGetPrismicClientMocked = mocked(getPrismicClient);

        mockedGetPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        {type: 'heading', text: 'My new post'}
                    ],
                    content: [
                        {type: 'paragraph', text: 'Post content'}
                    ],
                },
                last_publication_date: '04-01-2021'
            })
        } as any);

        const response = await getStaticProps({
            params: { slug: 'my-new-post' }
        } as any)

        expect(response).toEqual(
            expect.objectContaining({
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My new post',
                        content: '<p>Post content</p>',
                        updatedAt: '2021 M04 01',
                    }
                }
            })
        )
    });

})