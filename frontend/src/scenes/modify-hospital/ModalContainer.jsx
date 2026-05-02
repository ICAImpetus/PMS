export const ModalContainer = ({ isOpen, onClose, content }) => {
    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box sx={{ ...modalStyle }}>
                {content}
            </Box>
        </Modal>
    );
};
