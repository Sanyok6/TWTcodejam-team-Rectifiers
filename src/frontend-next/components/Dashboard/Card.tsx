"use client";

import {
	AspectRatio,
	Box,
	Button,
	Skeleton,
	Stack,
	StackProps,
	Text,
	useBreakpointValue,
	useColorModeValue,
	Tooltip,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	FormControl,
	FormLabel,
	ModalOverlay,
	ModalFooter,
	useDisclosure,
	ModalCloseButton,
	Input,
	InputGroup,
	InputRightElement,
	useToast,
	Select,
	Spinner,
	AccordionButton,
	Accordion,
	AccordionItem,
	AccordionPanel,
} from "@chakra-ui/react";
import React, { useState, useContext } from "react";
import { CloseIcon } from "@chakra-ui/icons";
import Image from "@/utils/next-chakra-image";

import { Icon, IconButton, IconButtonProps, LightMode } from "@chakra-ui/react";
import { FiInfo, FiPlay, FiStar } from "react-icons/fi";
import AuthCtx from "@/lib/auth";
import { useRouter } from "next/navigation";
import { games } from "./GameCardStack";
import DashboardCtx from "@/lib/dashboard";
import { PathCtx } from "@/utils/useNavigationEvent";

export const InfoButton = (props: IconButtonProps) => (
	<LightMode>
		<IconButton
			isRound
			bg="white"
			color="gray.900"
			size="sm"
			_hover={{ transform: "scale(1.1)" }}
			sx={{ ":hover > svg": { transform: "scale(1.1)" } }}
			transition="all 0.15s ease"
			icon={<Icon as={FiInfo} transition="all 0.15s ease" />}
			boxShadow="base"
			{...props}
		/>
	</LightMode>
);

export const FavouriteButton = (props: IconButtonProps) => (
	<LightMode>
		<IconButton
			isRound
			bg="white"
			color="gray.900"
			size="sm"
			_hover={{ transform: "scale(1.1)" }}
			sx={{ ":hover > svg": { transform: "scale(1.1)" } }}
			transition="all 0.15s ease"
			icon={<Icon as={FiStar} transition="all 0.15s ease" />}
			boxShadow="base"
			{...props}
		/>
	</LightMode>
);

export interface StudySetQuestion {
	question: string;
	answers: Array<string>;
}

export interface StudySet {
	id: Number;
	subject: string;
	questions: Array<StudySetQuestion>;
}

interface Props {
	studySet: StudySet;
	rootProps?: StackProps;
	updateStudySet: Function;
	deleteStudySet: Function;
}

const Card = (props: Props) => {
	const path = useContext(PathCtx);
	const imageUrl =
		"https://media.istockphoto.com/vectors/thumbnail-image-vector-graphic-vector-id1147544807?k=20&m=1147544807&s=612x612&w=0&h=pBhz1dkwsCMq37Udtp9sfxbjaMl27JUapoyYpQm0anc=";
	const { studySet, updateStudySet, rootProps } = props;
	const { id, subject } = studySet;
	const [isLoading, setLoading] = useState<boolean>(true);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { setGameSession } = useContext(AuthCtx);
	const [selected, setSelected] = useState<string>("");
	const [deletePressed, setDeletePressed] = useState<boolean>(false);
	const { isOpen: isDOpen, onOpen: onDOpen, onClose: onDClose } = useDisclosure();
	const toast = useToast();
    const Router = useRouter();

	const { user } = useContext(DashboardCtx);

	const deleteStudySet = async () => {
		const response = await fetch(`/api/studysets/${id}/delete_study_set/`, {
			method: "DELETE",
			headers: {'Content-Type': 'application/json'}
		});
		
		if (response.status === 200) {
			props.deleteStudySet(id);
		} else {
			toast({
				title: "Error while deleting studyset",
                status: "error",
				description: (await response.json()).detail[0].msg
			})
		}
	};

	function onDComplete() {
		if (selected === "") {
			toast({
				title: "Please select a game",
				variant: "warning"
			})
			return;
		}
		setGameSession({
            game: selected,
            studySet,
			avatar: user.profile_picture_index,
        });
		path.setPath(true);
        Router.push("/games");
	}
	return (
		<Stack
			spacing={useBreakpointValue({ base: "4", md: "5" })}
			{...rootProps}
		>
			<Box
				maxW={"320px"}
				w={"full"}
				bg={useColorModeValue("white", "gray.700")}
				boxShadow={"2xl"}
				rounded={"xl"}
				p={4}
				textAlign={"center"}
			>
				<Box position="relative">
					<AspectRatio ratio={10 / 9}>
						<>
							{isLoading && <Skeleton />}
							<Image
								src={imageUrl}
								alt={subject}
								fill={true}
								pointerEvents="none"
								onLoadingComplete={() => setLoading(false)}
								display={isLoading ? "none" : undefined}
								borderRadius={useBreakpointValue({
									base: "md",
									md: "xl",
								})}
							/>
						</>
					</AspectRatio>
				</Box>
				<Stack mt={2} mb={3}>
					<Stack spacing="1">
						<Tooltip
							label={subject}
							aria-label={`tooltip ${subject}`}
							hasArrow
						>
							<Text
								fontWeight="medium"
								color={useColorModeValue("gray.700", "white")}
								fontSize="2xl"
								overflow="hidden"
								whiteSpace="nowrap"
								textOverflow="ellipsis"
								width="100%"
							>
								{subject}
							</Text>
						</Tooltip>
					</Stack>
				</Stack>
				<Stack align="center" mb={2}>
					<Button
						colorScheme="blue"
						width="full"
						fontSize={"sm"}
						onClick={onDOpen}
					>
						<FiPlay />
						<Text ml="0.5em">{"Play"}</Text>
					</Button>
					<Modal isOpen={isDOpen} onClose={onDClose}>
						<ModalOverlay />
						<ModalContent>
							<ModalHeader>Select a game to play</ModalHeader>
							<ModalBody>
								<Select placeholder="select a game to play" value={selected} onChange={(e: any) => setSelected(e.target.value)}>
									{games.map((i, ind) => (
										<option key={ind} value={i.gameName}>{i.name}</option>
									))}
								</Select>
							</ModalBody>
							<ModalFooter>
								<Button colorScheme="blue" mr={3} onClick={onDComplete}>
									Play
								</Button>
								<Button colorScheme="red" mr={3} onClick={onDClose}>
									Cancel
								</Button>
							</ModalFooter>
						</ModalContent>
					</Modal>
				</Stack>
				<Stack align="center" direction="row">
					<Button
						colorScheme="yellow"
						width="full"
						flex={1}
						fontSize={"sm"}
						onClick={onOpen}
					>
						Edit
					</Button>
					<EditStudySetModal
						isOpen={isOpen}
						onClose={onClose}
						currentStudySet={studySet}
						updateStudySet={updateStudySet}
					/>
					<Button
						colorScheme="red"
						width="full"
						flex={1}
						fontSize={"sm"}
						onClick={() => {
							setDeletePressed(true)
							deleteStudySet()
						}}
					>
						Delete
						<Spinner ml="3" hidden={!deletePressed} />
					</Button>
				</Stack>
			</Box>
		</Stack>
	);
};

const EditStudySetModal = (props: any) => {
	const { currentStudySet, updateStudySet } = props;
	const {
		id,
		subject: currentSubject,
		questions: currentQuestions,
	} = currentStudySet;

	const { isOpen, onClose: oC } = props;
	const [v, setV] = useState<string>(currentSubject);
	const [questions, setQuestions] =
		useState<Array<StudySetQuestion>>(currentQuestions);
	const [editPressed, setEditPressed] = useState<boolean>(false);

	const toast = useToast();

	function onClose() {
		setEditPressed(false)
		setQuestions(currentQuestions);
		setV(currentSubject);
		oC();
	}

	const handleSubmission = async () => {
		if (questions.length < 1) {
			toast({
				title: "Please fill in something.",
				variant: "warning"
			});
			return;
		}
		const values = {
			subject: v,
			questions: questions,
		};

		const res = await fetch(`/api/studysets/${id}/update/`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(values),
		});

		if (!res.ok) {
			toast({
				title: "Something went wrong",
				description: res
					? (await res.json()).detail || "err"
					: "Something went wrong while creating studyset. Please try again.",
				status: "error",
				isClosable: true,
				duration: 4000,
			});
			return;
		}

		updateStudySet(await res.json());

		onClose();
	};

	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Edit study set</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<FormControl>
							<FormLabel htmlFor="subject">
								Subject or Name
							</FormLabel>
							<Input
								id="subject"
								placeholder="Your subject/name here"
								value={v}
								onChange={(e: any) => setV(e.target.value)}
							/>
						</FormControl>
						<Accordion>
							{questions.map((i, ind) => (
								<AccordionItem>
									<FormControl key={ind} mt={4}>
										<FormLabel htmlFor={`q${ind}`}>Question {ind+1}</FormLabel>
										<AccordionButton>
											<InputGroup display="flex" flexDir="row" alignItems="center" justifyContent="center">
												<Input id={`q${ind}`} placeholder="Your question here" value={i.question} onChange={(e: any) => setQuestions(qs => {
													let newQ = [...qs];
													newQ[ind] = {
														...newQ[ind],
														question: e.target.value
													}
													return newQ;
												})} />
												<InputRightElement onClick={() => setQuestions(qs => {
													let newQ = [...qs];
													newQ = newQ.filter((_, i) => i !== ind);
													return newQ;
												})}><CloseIcon /></InputRightElement>
											</InputGroup>
										</AccordionButton>

											<AccordionPanel mt="1">
												{i.answers.map((ite, idx) => (
                                                    <Box borderLeft={"solid"} borderColor={"blue.300"} >
														<InputGroup
															key={idx}
															display="flex"
															flexDir="row"
															alignItems="center"
															justifyContent="center"
														>
															<Input
																alignSelf="center"
																ml={1}
																value={ite}
																onChange={(e: any) =>
																	setQuestions((qs) => {
																		let newQ = [...qs];
																		if (
																			newQ[ind]
																				.answers[
																				idx
																			] !== undefined
																		) {
																			newQ[ind] = {
																				...newQ[
																					ind
																				],
																				answers:
																					newQ[
																						ind
																					].answers.map(
																						(
																							answer,
																							i
																						) =>
																							i ===
																							idx
																								? e
																										.target
																										.value
																								: answer
																					),
																			};
																		}
																		return newQ;
																	})
																}
															/>
															<InputRightElement
																mt="auto"
																onClick={() =>
																	setQuestions((qs) => {
																		let newQ = [...qs];
																		newQ[ind] = {
																			...newQ[ind],
																			answers: newQ[
																				ind
																			].answers.filter(
																				(_, i) =>
																					i !==
																					idx
																			),
																		};
																		return newQ;
																	})
																}
															>
																<CloseIcon />
															</InputRightElement>
														</InputGroup>
													</Box>
												))}
												<Button
													m={3}
													onClick={() =>
														setQuestions((qs) => {
															let newQ = [...qs];
															newQ[ind] = {
																...newQ[ind],
																answers: [
																	...newQ[ind]
																		.answers,
																	"",
																],
															};
															return newQ;
														})
													}
												>
													Add Answer
												</Button>
											</AccordionPanel>
										</FormControl>
								</AccordionItem>
							))}
						</Accordion>
						<Button
							mt={5}
							width={"80%"}
							colorScheme="blue"
							onClick={() =>
								setQuestions((questions) => [
									...questions,
									{ question: "", answers: [] },
								])
							}
						>
							Add Question
						</Button>
					</ModalBody>
					<ModalFooter>
						<Button
							colorScheme="blue"
							mr={3}
							disabled={editPressed}
							onClick={() => {
								setEditPressed(true)
								handleSubmission()
							}}
						>
							<Text hidden={editPressed}>Save edit</Text>
							<Spinner hidden={!editPressed} />
						</Button>
						<Button colorScheme="red" mr={3} onClick={onClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default Card;
