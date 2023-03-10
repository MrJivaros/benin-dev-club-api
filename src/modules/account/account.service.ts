import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { hashPassword } from "src/helpers/passwordEncrypt-helper";
import { DataSource, Repository } from "typeorm";
import { LoginInput } from "../auth/auth.service";
import { GratuationEntity } from "../gratuation/gratuation.entity";
import { ProfilEntity } from "../profil/profil.entity";
import { AccountEntity } from "./account.entity";

@Injectable()
export class AccountService {
	constructor(
		@InjectRepository(AccountEntity)
		private readonly accountRepository: Repository<AccountEntity>,

		private readonly dataSource: DataSource,
	) {}

	async create({ password, email }: LoginInput) {
		const passwordHash = await hashPassword(password);
		return await this.accountRepository.save({ email, passwordHash });
	}

	async findByEmail(email: string) {
		const user = await this.accountRepository.findOne({
			where: { email },
		});

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}

	async account(id: string): Promise<AccountEntity> {
		const user = await this.accountRepository.findOne({
			where: {
				id,
			},
		});

		if (!user) {
			throw new NotFoundException();
		}

		return {
			...user,
			passwordHash: undefined,
		};
	}

	async createGratuation(profilId: string) {
		const repo = this.dataSource.getRepository(GratuationEntity);
		return await repo.save({ profilId });
	}

	async createProfil(accountId: string) {
		const profileRepository = this.dataSource.getRepository(ProfilEntity);
		const profil = await profileRepository.save({ accountId });
		await this.createGratuation(profil.accountId);
		return profil;
	}
}
