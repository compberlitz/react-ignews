import { render, screen, fireEvent } from "@testing-library/react"
import { useSession, signIn } from "next-auth/client";
import { useRouter } from "next/router";
import { mocked } from "ts-jest/utils";
import { SubscribeButton } from ".";

jest.mock('next-auth/client');

jest.mock('next/router');

describe('Subscribe button component', () => {
    it('renders correctly', () => {
        const mockedUseSession = mocked(useSession);

        mockedUseSession.mockReturnValueOnce([null, false]);

        render(<SubscribeButton/>)

        expect(screen.getByText('Subscribe now')).toBeInTheDocument();
    })

    it('redirects user to sign in when not authenticated', () => {
        const mockedSignIn = mocked(signIn);
        const mockedUseSession = mocked(useSession);

        mockedUseSession.mockReturnValueOnce([null, false]);

        render(<SubscribeButton/>);

        const subscribeButton = screen.getByText('Subscribe now');

        fireEvent.click(subscribeButton);

        expect(mockedSignIn).toHaveBeenCalled();
    });

    it('redirect to post page when user is not authenticated', () => {
        const mockedUseRouter = mocked(useRouter);
        const mockedUseSession = mocked(useSession);

        mockedUseSession.mockReturnValueOnce([{user: {name: 'John Doe', email: 'john.doe@example.com'}, expires: 'fake-expires', activeSubscription: 'fake-active-subscription'}, false]);

        const mockPush = jest.fn();

        mockedUseRouter.mockReturnValueOnce({
            push: mockPush
        } as any)

        render(<SubscribeButton/>);

        const subscribeButton = screen.getByText('Subscribe now');

        fireEvent.click(subscribeButton);

        expect(mockPush).toHaveBeenCalled();
    })
})