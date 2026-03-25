import type { ComponentPropsWithoutRef } from 'react';

export default function AppLogoIcon(props: ComponentPropsWithoutRef<'img'>) {
    const { className, ...rest } = props;

    return (
        <img
            src="/images/becagest-logo.png"
            alt="BecaGest"
            className={className}
            {...rest}
        />
    );
}
